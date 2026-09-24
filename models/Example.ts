import {
    getModelForClass, modelOptions, prop,
} from '@typegoose/typegoose';
import { DefaultSchemaOptions } from '../basic/schemaOptions';

@modelOptions({
    schemaOptions: {
        collection: 'Example',
        ...DefaultSchemaOptions,
    },
})
class ExampleSchema {
    @prop({ required: true })
    public name: string;

    @prop({ required: false, default: true })
    public enabled: boolean;

    public _created_at: Date;

    public _updated_at: Date;
}

const ExampleSchemaModel = getModelForClass(ExampleSchema);
type ExampleSchemaDoc = ExampleSchema;

export { ExampleSchemaModel, ExampleSchemaDoc };
