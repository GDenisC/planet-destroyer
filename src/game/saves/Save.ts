import { ISave } from './ISave';

export class Save {
    public static readonly VERSION = 0;
    public static readonly INITIAL_SIZE = 0xFFFF;
    public static readonly LITTLE_ENDIAN = true;
    private dataview: DataView;
    private offset = 0;

    public constructor(
        private u8 = new Uint8Array(Save.INITIAL_SIZE),
        private length = Save.INITIAL_SIZE
    ) {
        this.dataview = new DataView(this.u8.buffer);
    }

    public static fromU8(u8: Uint8Array) {
        return new Save(u8, u8.length);
    }

    public static fromLocalStorage(): Save | undefined {
        const storage = localStorage.getItem('save');

        if (!storage) return undefined;

        return Save.fromU8(
            new Uint8Array(atob(storage)
                .split('')
                .map(char => char.charCodeAt(0))
            )
        );
    }

    public toLocalStorage() {
        localStorage.setItem('save', btoa(
            Array.from(this.u8.slice(0, this.offset))
                .map(byte => String.fromCharCode(byte))
                .join('')
        ));
    }

    private grow() {
        let newU8 = new Uint8Array(this.length += Save.INITIAL_SIZE);
        newU8.set(this.u8, 0);
        this.u8 = newU8;
        this.dataview = new DataView(this.u8.buffer);
    }

    private shouldGrow(length: number) {
        if (this.offset + length > this.length) {
            this.grow();
        }
    }

    public writeU8(value: number) {
        this.shouldGrow(1);
        this.u8[this.offset] = value;
        this.offset += 1;
    }

    public writeU16(value: number) {
        this.shouldGrow(2);
        this.dataview.setUint16(this.offset, value, Save.LITTLE_ENDIAN);
        this.offset += 2;
    }

    public writeU32(value: number) {
        this.shouldGrow(4);
        this.dataview.setUint32(this.offset, value, Save.LITTLE_ENDIAN);
        this.offset += 4;
    }

    public writeF64(value: number) {
        this.shouldGrow(8);
        this.dataview.setFloat64(this.offset, value, Save.LITTLE_ENDIAN);
        this.offset += 8;
    }

    public writeBoolean(value: boolean) {
        this.writeU8(value ? 1 : 0);
    }

    public writeString(value: string) {
        this.shouldGrow(value.length + 1);
        for (let i = 0; i < value.length; i++) {
            this.u8[this.offset] = value.charCodeAt(i);
            this.offset += 1;
        }
        this.u8[this.offset] = 0;
        this.offset += 1;
    }

    public write(data: ISave) {
        data.onSave(this);
    }

    public writeArray(arr: ISave[]) {
        this.writeU8(arr.length);
        for (let i = 0; i < arr.length; i++) {
            this.write(arr[i]);
        }
    }

    public isCorrupted() {
        return this.offset > this.length;
    }

    private checkCorruption() {
        if (this.isCorrupted())
            throw new Error('Save is corrupted');
    }

    public readU8() {
        let value = this.u8[this.offset];
        this.offset += 1;
        this.checkCorruption();
        return value;
    }

    public readU16() {
        let value = this.dataview.getUint16(this.offset, Save.LITTLE_ENDIAN);
        this.offset += 2;
        this.checkCorruption();
        return value;
    }

    public readU32() {
        let value = this.dataview.getUint32(this.offset, Save.LITTLE_ENDIAN);
        this.offset += 4;
        this.checkCorruption();
        return value;
    }

    public readF64() {
        let value = this.dataview.getFloat64(this.offset, Save.LITTLE_ENDIAN);
        this.offset += 8;
        this.checkCorruption();
        return value;
    }

    public readBoolean() {
        return this.readU8() == 1;
    }

    public readString() {
        let value = '';
        while (this.u8[this.offset] != 0) {
            value += String.fromCharCode(this.readU8());
        }
        this.offset += 1;
        this.checkCorruption();
        return value;
    }

    public load(data: ISave) {
        data.onLoad(this);
    }

    public loadArray(arr: ISave[]) {
        let length = this.readU8();
        for (let i = 0; i < length; ++i) {
            this.load(arr[i]);
        }
    }
}