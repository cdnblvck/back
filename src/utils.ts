const generateJWT = (user) => {
  const today = new Date();
  const exp = new Date();
  exp.setDate(today.getDate() + 1);

  /*return jwt.sign(
    {
      id: user._id || null,
      email: user.email || user.username,
      exp: Math.floor(exp.getTime() / 1000),
    },
    process.env.JWT_SECRET || 'secret_test_@s)/!-_-:;5s8shd~&9)=]8sgf"{@',
  );*/
  return null;
};

const transformEntity = async (user, withToken) => {
  user = user.toObject();
  if (user) {
    user.image = user.image || 'image';
    if (withToken) {
      delete user.password;
      user.token = await generateJWT(user);
    }
  }
  return user;
};

/**
 * Transform user entity (remove password and all protected fields)
 * @param docs
 * @param params
 * @returns {Promise<*>}
 */
const transformDocuments = async (docs, params) => {
  const objet = docs.toObject();
  for (let p of params) {
    delete objet[p];
  }
  objet.token = generateJWT(objet);
  return objet;
};
// Function to check for booking clash
let clashesWithExisting = async (
  existingBookingStart,
  existingBookingEnd,
  newBookingStart,
  newBookingEnd,
) => {
  if (
    (newBookingStart >= existingBookingStart &&
      newBookingStart < existingBookingEnd) ||
    (existingBookingStart >= newBookingStart &&
      existingBookingStart < newBookingEnd)
  ) {
    throw new Error(
      `Booking could not be saved. There is a clash with an existing booking from ${existingBookingStart} to ${existingBookingEnd}`,
    );
  }
  return false;
};

let hasClash = async (rental, reservation) => {
  return rental.reservations.map((booking) => {
    // Convert existing booking Date objects into number values
    let existingBookingStart = new Date(booking.startDate).getTime();
    let existingBookingEnd = new Date(booking.endDate).getTime();
    // Check whether there is a clash between the new booking and the existing booking
    return !clashesWithExisting(
      existingBookingStart,
      existingBookingEnd,
      reservation.startDate,
      reservation.endDate,
    );
  });
};
