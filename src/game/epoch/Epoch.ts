export default class Epoch {
    public points = 0;

    public static calculatePoints(level: number): number {
        return Math.round(Math.pow(level / 100, 1.1));
    }

    public static calculateProgress(level: number): number {
        return level / 100;
    }
}