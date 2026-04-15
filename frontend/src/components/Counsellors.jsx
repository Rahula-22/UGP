import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { COUNSELLORS } from "../config/counsellors";

const STORAGE_KEY = "serenelyCounsellorBookings";

const formatIcons = {
  Video,
  Voice: PhoneCall,
  Chat: MessageCircle,
};

function CounsellorCard({ counsellor, onBook }) {
  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-100 via-white to-slate-200 ring-1 ring-gray-200/70">
        <img
          src={counsellor.image}
          alt={counsellor.imageAlt}
          className="h-72 w-full object-contain object-center"
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mt-5 text-lg font-extrabold tracking-tight text-gray-900">{counsellor.name}</div>
          <div className="mt-1 text-sm text-gray-500">{counsellor.civilianName}</div>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${counsellor.badgeTone}`}>
          Character placeholder
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-800">{counsellor.tagline}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{counsellor.bio}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {counsellor.focus.map((item) => (
          <span
            key={`${counsellor.id}-${item}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200/70">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Session style</div>
        <div className="mt-2 text-sm text-gray-700">{counsellor.style}</div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <div className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-sky-600" />
          {counsellor.availability}
        </div>
        <div className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-violet-600" />
          {counsellor.fee}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {counsellor.formats.map((format) => {
          const Icon = formatIcons[format];
          return (
            <div
              key={`${counsellor.id}-${format}`}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
            >
              <Icon className="h-3.5 w-3.5" />
              {format}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onBook(counsellor)}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r ${counsellor.accent} px-4 py-3 text-sm font-semibold text-white shadow hover:opacity-95`}
      >
        Book a session
      </button>
    </div>
  );
}

export default function Counsellors({ onBack, user }) {
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("Video");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [bookings, setBookings] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);

  useEffect(() => {
    const savedBookings = localStorage.getItem(STORAGE_KEY);
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch {
        setBookings([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const upcomingBookings = useMemo(
    () =>
      [...bookings].sort((a, b) =>
        (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)
      ),
    [bookings]
  );

  const closeBookingModal = () => {
    setSelectedCounsellor(null);
    setSelectedFormat("Video");
    setSelectedSlot("");
    setNote("");
    setEditingBookingId(null);
  };

  const openBookingModal = (counsellor) => {
    setEditingBookingId(null);
    setSelectedCounsellor(counsellor);
    setSelectedFormat(counsellor.formats[0]);
    setSelectedSlot(counsellor.slots[0]);
    setNote("");
  };

  const handleRescheduleBooking = (booking) => {
    const counsellor = COUNSELLORS.find((item) => item.id === booking.counsellorId);
    if (!counsellor) {
      setConfirmation(`This counsellor profile is no longer available for rescheduling.`);
      return;
    }

    setEditingBookingId(booking.id);
    setSelectedCounsellor(counsellor);
    setSelectedFormat(
      counsellor.formats.includes(booking.format) ? booking.format : counsellor.formats[0]
    );
    setSelectedSlot(counsellor.slots.includes(booking.slot) ? booking.slot : counsellor.slots[0]);
    setNote(booking.note || "");
  };

  const handleDeleteBooking = (bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;

    setBookings((current) => current.filter((item) => item.id !== bookingId));
    setConfirmation(`Session with ${booking.counsellorName} was deleted.`);

    if (editingBookingId === bookingId) {
      closeBookingModal();
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedCounsellor || !selectedSlot) return;

    const timestamp = new Date().toISOString();

    if (editingBookingId) {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === editingBookingId
            ? {
                ...booking,
                counsellorId: selectedCounsellor.id,
                counsellorName: selectedCounsellor.name,
                civilianName: selectedCounsellor.civilianName,
                slot: selectedSlot,
                format: selectedFormat,
                note: note.trim(),
                updatedAt: timestamp,
              }
            : booking
        )
      );
      setConfirmation(`Session with ${selectedCounsellor.name} was rescheduled to ${selectedSlot}.`);
      closeBookingModal();
      return;
    }

    const booking = {
      id: `${selectedCounsellor.id}-${Date.now()}`,
      counsellorId: selectedCounsellor.id,
      counsellorName: selectedCounsellor.name,
      civilianName: selectedCounsellor.civilianName,
      slot: selectedSlot,
      format: selectedFormat,
      note: note.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
      bookedFor: user?.username || "Guest user",
    };

    setBookings((current) => [booking, ...current]);
    setConfirmation(`Session booked with ${selectedCounsellor.name} for ${selectedSlot}.`);
    closeBookingModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-violet-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="mt-6 rounded-[2rem] border border-gray-200/70 bg-white/75 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Users className="h-4 w-4" />
                Counsellor support
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Book time with a counsellor when you need a human-style check-in.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
                This section lets users browse counsellors, choose a format, and reserve a session. For now, the
                profiles use character-inspired placeholders while the booking experience is being shaped.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-200/70">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Connect</div>
                  <div className="mt-1 text-sm font-extrabold text-sky-900">Browse by fit</div>
                </div>
                <div className="rounded-2xl bg-violet-50 px-4 py-3 ring-1 ring-violet-200/70">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Book</div>
                  <div className="mt-1 text-sm font-extrabold text-violet-900">Choose slot + format</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200/70">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Privacy</div>
                  <div className="mt-1 text-sm font-extrabold text-emerald-900">Stored on this device</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-sky-500/10 via-white to-violet-600/10 p-6 ring-1 ring-gray-200/60">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-gray-900">Booking snapshot</div>
                  <div className="mt-1 text-sm text-gray-600">Keep this lightweight until real counsellor profiles are ready.</div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-gray-200/70">
                  <div className="text-xs font-semibold text-gray-500">Available demo counsellors</div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">{COUNSELLORS.length}</div>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-gray-200/70">
                  <div className="text-xs font-semibold text-gray-500">Booked sessions</div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">{upcomingBookings.length}</div>
                </div>
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200/70">
                  Demo mode: bookings are saved in local storage only.
                </div>
              </div>
            </div>
          </div>
        </div>

        {confirmation && (
          <div className="mt-6 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" />
            <div className="text-sm font-semibold">{confirmation}</div>
          </div>
        )}

        {upcomingBookings.length > 0 && (
          <div className="mt-8 rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold tracking-tight text-gray-900">Your booked sessions</div>
                <div className="mt-1 text-sm text-gray-600">A quick view of the sessions reserved on this device.</div>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                {upcomingBookings.length} booked
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {upcomingBookings.map((booking) => {
                const Icon = formatIcons[booking.format] || MessageCircle;
                return (
                  <div
                    key={booking.id}
                    className="rounded-3xl border border-gray-200/70 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-extrabold text-gray-900">{booking.counsellorName}</div>
                        <div className="mt-1 text-sm text-gray-500">{booking.civilianName}</div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        <Icon className="h-3.5 w-3.5" />
                        {booking.format}
                      </div>
                    </div>
                    <div className="mt-4 text-sm font-semibold text-gray-800">{booking.slot}</div>
                    {booking.note && <div className="mt-2 text-sm text-gray-600">Note: {booking.note}</div>}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleRescheduleBooking(booking)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-lg font-extrabold tracking-tight text-gray-900">Choose a counsellor</div>
              <div className="mt-1 text-sm text-gray-600">Pick someone whose support style matches the moment you are in.</div>
            </div>
            <div className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 sm:inline-flex">
              Placeholder roster
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {COUNSELLORS.map((counsellor) => (
              <CounsellorCard key={counsellor.id} counsellor={counsellor} onBook={openBookingModal} />
            ))}
          </div>
        </div>
      </div>

      {selectedCounsellor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-4 sm:items-center sm:py-8">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-gray-200/80 bg-white p-6 shadow-2xl sm:max-h-[calc(100vh-4rem)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-extrabold tracking-tight text-gray-900">{selectedCounsellor.name}</div>
                <div className="mt-1 text-sm text-gray-500">{selectedCounsellor.civilianName}</div>
              </div>
              <button
                type="button"
                onClick={closeBookingModal}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-100 via-white to-slate-200 ring-1 ring-gray-200/70">
              <img
                src={selectedCounsellor.image}
                alt={selectedCounsellor.imageAlt}
                className="h-72 w-full object-contain object-center"
              />
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Choose format</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {selectedCounsellor.formats.map((format) => {
                  const Icon = formatIcons[format];
                  const isActive = selectedFormat === format;
                  return (
                    <button
                      key={`${selectedCounsellor.id}-${format}`}
                      type="button"
                      onClick={() => setSelectedFormat(format)}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow"
                          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {format}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Available slots</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {selectedCounsellor.slots.map((slot) => {
                  const isActive = selectedSlot === slot;
                  return (
                    <button
                      key={`${selectedCounsellor.id}-${slot}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? "bg-violet-50 text-violet-900 ring-2 ring-violet-300"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="booking-note" className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Add a note for the session
              </label>
              <textarea
                id="booking-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Example: I want to talk about burnout, low motivation, and trouble sleeping."
                className="mt-3 w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeBookingModal}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className={`rounded-2xl bg-gradient-to-r ${selectedCounsellor.accent} px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95`}
              >
                {editingBookingId ? "Save changes" : "Confirm booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
