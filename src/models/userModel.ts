import { Schema, model, Document, Model } from 'mongoose';
import { IUser } from '../interfaces/modelInterfaces';

const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    googleId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});


// Static method for Google OAuth
userSchema.statics.findByGoogleId = function (googleId: string) {
    return this.findOne({ googleId });
};


export const User = model<IUser>('User', userSchema);
