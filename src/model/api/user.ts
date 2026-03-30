// import mongoose, { Schema } from "mongoose";

// const userSchema = new Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,  // normalize email to lowercase
//         match: [/\S+@\S+\.\S+/, 'Invalid email format'] // email validation pattern
//     },
//     password: {
//         type: String,
//         required: true
//     }
// });

// const User = mongoose.models.User || mongoose.model('User', userSchema);
// export default User;



import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  role: "admin" | "user"; // User role
  avatar?: string;
  isVerified?: boolean;
}

const UserSchema = new Schema<IUser>({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }, // Default: user
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
