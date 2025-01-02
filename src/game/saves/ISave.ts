import { Save } from './Save';

export interface ISave {
    onSave(save: Save): void;
    onLoad(save: Save): void;
}