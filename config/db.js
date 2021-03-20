const {
  MONGO_USERNAME = "manhtien465",
  MONGO_PASSWORD = "tien1234",
  MONGO_DATABASE = "test1111"
} = process.env



module.exports = {
  MONGO_Option: {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  },
  //MONGO_URI: `mongodb+srv://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PASSWORD)}@cluster0-vaatg.mongodb.net/${MONGO_DATABASE}?retryWrites=true&w=majority`
  MONGO_URI: `mongodb://localhost/game`
}