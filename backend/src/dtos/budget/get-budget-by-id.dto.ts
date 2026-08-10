import { CustomError } from "../../errors/CustomError";

export class GetBudgetByIdDto {
    private constructor(public readonly id: number) { }

    static create(object: { [key: string]: any } = {}): [CustomError?, GetBudgetByIdDto?] {
        const { id } = object;

        if (!id) return [CustomError.badRequest('Missing budget ID')];

        const parsedId = Number(id);
        if (isNaN(parsedId) || parsedId <= 0) {
            return [CustomError.badRequest('ID must be a valid positive integer')];
        }

        return [undefined, new GetBudgetByIdDto(parsedId)];
    }
}