import bookingsData from "../data/json/bookings.json";

// Fonction pour générer un ID unique
const generateBookingId = () => {
  return (
    "booking_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
};

// Fonction pour sauvegarder une nouvelle réservation
export const saveBooking = (bookingData) => {
  try {
    const newBooking = {
      id: generateBookingId(),
      timestamp: new Date().toISOString(),
      status: "pending",
      ...bookingData,
    };

    let existingBookings = [];
    const storedBookings = localStorage.getItem("bookings");
    if (storedBookings) {
      existingBookings = JSON.parse(storedBookings);
    }

    existingBookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(existingBookings));

    return {
      success: true,
      booking: newBooking,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Fonction pour récupérer toutes les réservations
export const getAllBookings = () => {
  try {
    const storedData = localStorage.getItem("bookings");
    const bookings = storedData ? JSON.parse(storedData) : [];
    return {
      success: true,
      bookings,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      bookings: [],
    };
  }
};

// Fonction pour récupérer une réservation par ID
export const getBookingById = (bookingId) => {
  try {
    const storedData = localStorage.getItem("bookings");
    const bookings = storedData ? JSON.parse(storedData) : [];
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      throw new Error("Réservation non trouvée");
    }

    return {
      success: true,
      booking,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Fonction pour mettre à jour le statut d'une réservation
export const updateBookingStatus = (bookingId, newStatus) => {
  try {
    const storedData = localStorage.getItem("bookings");
    let bookings = storedData ? JSON.parse(storedData) : [];
    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

    if (bookingIndex === -1) {
      throw new Error("Réservation non trouvée");
    }

    bookings[bookingIndex].status = newStatus;
    localStorage.setItem("bookings", JSON.stringify(bookings));

    return {
      success: true,
      booking: bookings[bookingIndex],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
