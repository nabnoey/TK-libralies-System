const User = require('./user.model')
const KaraokeRoom = require('./karaokeRoom.model')
const MovieSeat = require('./movieSeat.model')
const Reservation = require('./reservation.model')

// User - Reservation associations
User.hasMany(Reservation, {
    foreignKey: 'userId',
    as: 'reservations'
})

Reservation.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

// KaraokeRoom - Reservation associations
KaraokeRoom.hasMany(Reservation, {
    foreignKey: 'itemId',
    constraints: false,
    scope: {
        reservationType: 'karaoke'
    },
    as: 'karaokeReservations'
})

Reservation.belongsTo(KaraokeRoom, {
    foreignKey: 'itemId',
    constraints: false,
    as: 'karaokeRoom'
})

// MovieSeat - Reservation associations
MovieSeat.hasMany(Reservation, {
    foreignKey: 'itemId',
    constraints: false,
    scope: {
        reservationType: 'movie'
    },
    as: 'movieReservations'
})

Reservation.belongsTo(MovieSeat, {
    foreignKey: 'itemId',
    constraints: false,
    as: 'movieSeat'
})

module.exports = {
    User,
    KaraokeRoom,
    MovieSeat,
    Reservation
}
