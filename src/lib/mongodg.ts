import mongoose from 'mongoose'

const connecMongoDB = async () => {
    const mongoUri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(mongoUri)
        console.log('connected to mongo db')
    } catch (e) {
        console.log(e)
    }
}
export default connecMongoDB