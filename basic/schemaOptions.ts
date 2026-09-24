import { SchemaOptions } from 'mongoose';

export const DefaultSchemaOptions: SchemaOptions = {
    toJSON: {
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            ret.objectId = ret._id.toString();
            ret.createdAt = ret._created_at;
            ret.updatedAt = ret._updated_at;
            delete ret._created_at;
            delete ret._updated_at;
            ret._wperm && delete ret._wperm;
            ret._rperm && delete ret._rperm;
            ret._acl && delete ret._acl;
        },
        versionKey: false,
    },
    versionKey: false,
};
