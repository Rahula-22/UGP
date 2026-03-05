"""
Hybrid emotion detection system for mental health chatbot
Combines lexicon-based and transformer-based approaches
"""

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import re
from typing import Dict
import warnings
warnings.filterwarnings('ignore')

class EmotionDetector:
    """
    Hybrid emotion detection combining lexicon-based and transformer models
    """
    
    def __init__(self, model_name="j-hartmann/emotion-english-distilroberta-base"):
        """
        Initialize the emotion detector with transformer model and lexicon
        
        Args:
            model_name: HuggingFace model for emotion detection
        """
        print("Loading emotion detection model...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.pipeline = pipeline(
                "text-classification", 
                model=self.model, 
                tokenizer=self.tokenizer,
                top_k=None,
                device=-1  # Use CPU
            )
            print("✓ Transformer model loaded successfully")
        except Exception as e:
            print(f"Warning: Could not load transformer model: {e}")
            self.pipeline = None
        
        # Initialize lexicon detector
        self.lexicon = EmotionLexicon()
        
        # Emotion mapping (transformer model → mental health categories)
        self.emotion_mapping = {
            'sadness': 'sadness',
            'fear': 'anxiety',
            'anger': 'anger',
            'joy': 'positive',
            'neutral': 'neutral',
            'disgust': 'anger',
            'surprise': 'neutral'
        }
        
        # Confidence threshold for lexicon-only mode
        self.lexicon_confidence_threshold = 0.85
    
    def detect_emotion(self, text: str) -> Dict:
        """
        Detect emotions using hybrid approach
        
        Args:
            text: User message to analyze
            
        Returns:
            Dictionary containing:
                - primary_emotion: Main detected emotion
                - confidence: Confidence score (0-1)
                - all_emotions: Scores for all emotions
                - intensity: Emotional intensity (low/medium/high)
                - method: Detection method used
        """
        if not text or len(text.strip()) < 3:
            return {
                'primary_emotion': 'neutral',
                'confidence': 1.0,
                'all_emotions': {'neutral': 1.0},
                'intensity': 'low',
                'method': 'default'
            }
        
        # Stage 1: Lexicon-based detection (fast)
        lexicon_scores = self.lexicon.analyze(text)
        max_lexicon_score = max(lexicon_scores.values())
        
        # If high confidence from lexicon, return early (speed optimization)
        if max_lexicon_score > self.lexicon_confidence_threshold and self.pipeline:
            primary_emotion = max(lexicon_scores, key=lexicon_scores.get)
            intensity = self._calculate_intensity(text, lexicon_scores)
            return {
                'primary_emotion': primary_emotion,
                'confidence': max_lexicon_score,
                'all_emotions': lexicon_scores,
                'intensity': intensity,
                'method': 'lexicon'
            }
        
        # Stage 2: Transformer-based detection (if available)
        if self.pipeline:
            try:
                transformer_scores = self._transformer_predict(text)
                
                # Stage 3: Ensemble (weighted combination)
                final_scores = self._ensemble(
                    lexicon_scores, 
                    transformer_scores,
                    lexicon_weight=0.3, 
                    transformer_weight=0.7
                )
                method = 'hybrid'
            except Exception as e:
                print(f"Warning: Transformer prediction failed: {e}")
                final_scores = lexicon_scores
                method = 'lexicon_fallback'
        else:
            final_scores = lexicon_scores
            method = 'lexicon_only'
        
        # Get primary emotion and confidence
        primary_emotion = max(final_scores, key=final_scores.get)
        confidence = final_scores[primary_emotion]
        
        # Calculate intensity
        intensity = self._calculate_intensity(text, final_scores)
        
        return {
            'primary_emotion': primary_emotion,
            'confidence': float(confidence),
            'all_emotions': {k: float(v) for k, v in final_scores.items()},
            'intensity': intensity,
            'method': method
        }
    
    def _transformer_predict(self, text: str) -> Dict[str, float]:
        """
        Get predictions from transformer model
        
        Args:
            text: Input text
            
        Returns:
            Dictionary of emotion scores
        """
        # Truncate very long texts
        if len(text) > 512:
            text = text[:512]
        
        results = self.pipeline(text)[0]
        
        # Convert to mental health emotion categories
        mapped_scores = {}
        for item in results:
            label = item['label'].lower()
            score = item['score']
            mapped_emotion = self.emotion_mapping.get(label, 'neutral')
            
            # If emotion already exists, take max score
            if mapped_emotion in mapped_scores:
                mapped_scores[mapped_emotion] = max(mapped_scores[mapped_emotion], score)
            else:
                mapped_scores[mapped_emotion] = score
        
        # Ensure all mental health categories exist
        for emotion in ['sadness', 'anxiety', 'stress', 'anger', 'loneliness', 'positive', 'neutral']:
            if emotion not in mapped_scores:
                mapped_scores[emotion] = 0.0
        
        return mapped_scores
    
    def _ensemble(self, lexicon_scores: Dict, transformer_scores: Dict, 
                  lexicon_weight: float, transformer_weight: float) -> Dict[str, float]:
        """
        Combine scores from lexicon and transformer methods
        
        Args:
            lexicon_scores: Scores from lexicon-based detector
            transformer_scores: Scores from transformer model
            lexicon_weight: Weight for lexicon scores
            transformer_weight: Weight for transformer scores
            
        Returns:
            Combined emotion scores
        """
        all_emotions = set(lexicon_scores.keys()) | set(transformer_scores.keys())
        final_scores = {}
        
        for emotion in all_emotions:
            lex_score = lexicon_scores.get(emotion, 0.0)
            trans_score = transformer_scores.get(emotion, 0.0)
            
            final_scores[emotion] = (
                lexicon_weight * lex_score + 
                transformer_weight * trans_score
            )
        
        # Normalize scores
        total = sum(final_scores.values())
        if total > 0:
            final_scores = {k: v/total for k, v in final_scores.items()}
        
        return final_scores
    
    def _calculate_intensity(self, text: str, scores: Dict) -> str:
        """
        Calculate emotional intensity based on text and scores
        
        Args:
            text: User message
            scores: Emotion scores
            
        Returns:
            'low', 'medium', or 'high'
        """
        max_score = max(scores.values())
        text_lower = text.lower()
        
        # Intensity markers
        high_markers = [
            'very', 'extremely', 'really', 'so', 'unbearable', 
            "can't", "won't", 'terribly', 'severely', 'completely',
            'absolutely', 'totally', 'utterly', '!!!'
        ]
        
        medium_markers = ['quite', 'fairly', 'somewhat', 'pretty', 'rather']
        
        # Check for high intensity markers
        for marker in high_markers:
            if marker in text_lower:
                return 'high'
        
        # Score-based intensity
        if max_score > 0.85:
            return 'high'
        elif max_score > 0.65 or any(marker in text_lower for marker in medium_markers):
            return 'medium'
        else:
            return 'low'


class EmotionLexicon:
    """
    Lexicon-based emotion detector using keywords and regex patterns
    """
    
    def __init__(self):
        """Initialize emotion lexicons with keywords and patterns"""
        self.lexicons = {
            'sadness': {
                'keywords': [
                    'sad', 'depressed', 'hopeless', 'miserable', 'down',
                    'unhappy', 'crying', 'tears', 'heartbroken', 'grief',
                    'sorrow', 'despair', 'gloomy', 'blue', 'dejected'
                ],
                'patterns': [
                    r'\bfeel(ing)? (down|low|sad|depressed|miserable)\b',
                    r'\bcan\'t stop crying\b',
                    r'\blife is (hard|difficult|meaningless|pointless)\b',
                    r'\bno hope\b',
                    r'\bwant to (give up|disappear)\b'
                ],
                'weight': 1.0
            },
            'anxiety': {
                'keywords': [
                    'anxious', 'worried', 'nervous', 'panic', 'fear',
                    'scared', 'restless', 'tense', 'uneasy', 'dread',
                    'afraid', 'terrified', 'paranoid', 'phobia'
                ],
                'patterns': [
                    r'\bworrying (about|constantly)\b',
                    r'\bpanic attack\b',
                    r'\bcan\'t (sleep|relax|breathe|calm down)\b',
                    r'\bheart (racing|pounding)\b',
                    r'\bafraid (of|that)\b',
                    r'\b(so|very) nervous\b'
                ],
                'weight': 1.0
            },
            'stress': {
                'keywords': [
                    'stressed', 'pressure', 'overwhelmed', 'exhausted',
                    'burned out', 'struggling', 'overworked', 'burden',
                    'swamped', 'drowning', 'crushing'
                ],
                'patterns': [
                    r'\btoo much (to|work|pressure)\b',
                    r'\bcan\'t (handle|cope|manage)\b',
                    r'\bunder (pressure|stress)\b',
                    r'\bburned out\b',
                    r'\bso (stressed|overwhelmed)\b'
                ],
                'weight': 1.0
            },
            'anger': {
                'keywords': [
                    'angry', 'furious', 'frustrated', 'irritated',
                    'annoyed', 'mad', 'rage', 'pissed', 'hate',
                    'enraged', 'hostile', 'resentful', 'bitter'
                ],
                'patterns': [
                    r'\b(so|very|really) (angry|mad|frustrated|pissed)\b',
                    r'\bmakes me (mad|angry|furious)\b',
                    r'\bhate (it|this|them|him|her)\b',
                    r'\bcan\'t stand\b'
                ],
                'weight': 1.0
            },
            'loneliness': {
                'keywords': [
                    'lonely', 'alone', 'isolated', 'abandoned',
                    'disconnected', 'empty', 'solitary', 'friendless',
                    'outcast', 'rejected', 'unwanted'
                ],
                'patterns': [
                    r'\bfeel(ing)? (so )?alone\b',
                    r'\bno (one|friends|support|family)\b',
                    r'\beveryone (left|abandoned|forgot)\b',
                    r'\bcompletely alone\b',
                    r'\bno one (cares|understands)\b'
                ],
                'weight': 1.0
            },
            'positive': {
                'keywords': [
                    'happy', 'grateful', 'hopeful', 'better', 'good',
                    'excited', 'joy', 'peaceful', 'content', 'blessed',
                    'wonderful', 'great', 'amazing', 'thankful', 'optimistic'
                ],
                'patterns': [
                    r'\bfeeling (better|good|great|happy|wonderful)\b',
                    r'\bthings are (improving|better|good)\b',
                    r'\b(so|very) (happy|grateful|thankful)\b',
                    r'\blife is (good|better|great)\b'
                ],
                'weight': 1.0
            },
            'neutral': {
                'keywords': ['okay', 'fine', 'normal', 'usual', 'alright'],
                'patterns': [r'\b(doing|feeling) (okay|fine|alright)\b'],
                'weight': 0.5
            }
        }
    
    def analyze(self, text: str) -> Dict[str, float]:
        """
        Analyze text using emotion lexicons
        
        Args:
            text: User message
            
        Returns:
            Dictionary of emotion scores (normalized)
        """
        text_lower = text.lower()
        scores = {}
        
        for emotion, data in self.lexicons.items():
            score = 0.0
            match_count = 0
            
            # Check keywords
            for keyword in data['keywords']:
                if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                    score += 0.25
                    match_count += 1
            
            # Check patterns (weighted more heavily)
            for pattern in data.get('patterns', []):
                if re.search(pattern, text_lower):
                    score += 0.4
                    match_count += 1
            
            # Apply weight and cap at 1.0
            scores[emotion] = min(score * data['weight'], 1.0)
        
        # Normalize scores
        total = sum(scores.values())
        if total > 0:
            scores = {k: v/total for k, v in scores.items()}
        else:
            # Default to neutral if no matches
            scores = {emotion: 0.0 for emotion in self.lexicons.keys()}
            scores['neutral'] = 1.0
        
        return scores


# Test function
if __name__ == "__main__":
    # Test the emotion detector
    detector = EmotionDetector()
    
    test_messages = [
        "I'm feeling really sad and hopeless today",
        "I'm so anxious about the exam, my heart is racing",
        "I'm completely overwhelmed with work and stress",
        "I'm so angry at what happened, I can't stand it",
        "I feel so alone, no one cares about me",
        "I'm feeling much better today, things are improving",
        "Just having a normal day, nothing special"
    ]
    
    print("\n" + "="*60)
    print("EMOTION DETECTION TEST")
    print("="*60)
    
    for message in test_messages:
        result = detector.detect_emotion(message)
        print(f"\nMessage: {message}")
        print(f"Emotion: {result['primary_emotion']} ({result['confidence']:.2%} confidence)")
        print(f"Intensity: {result['intensity']}")
        print(f"Method: {result['method']}")