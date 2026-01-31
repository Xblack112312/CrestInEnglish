import mongoose from 'mongoose';
import config from './config';

const ConnectToDatabase = async () => {
    try {
        await mongoose.connect(config.env.database_Url, {
            bufferCommands: false
        });
        console.log("Database Connect");
    } catch (error) {
        console.log(error);
    }
}

export default ConnectToDatabase