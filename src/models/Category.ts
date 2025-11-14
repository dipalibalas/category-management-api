import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategory extends Document {
   _id: Types.ObjectId;     
  name: string;
  parent?: Types.ObjectId | null;  // Use Types.ObjectId here
  status: 'active' | 'inactive';
}

const CategorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// Add an index on parent field for optimized queries
CategorySchema.index({ parent: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
