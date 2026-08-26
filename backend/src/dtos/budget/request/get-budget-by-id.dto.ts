import { CustomError } from "../../../errors/CustomError";

export class GetBudgetByIdDto {
    private constructor(public readonly id: number, public readonly userId: number) { }

    static create(object: { [key: string]: any } = {}, userId: number): [CustomError?, GetBudgetByIdDto?] {
        const { budgetId :id } = object;

        // console.log({object, userId});

        if (!id) return [CustomError.badRequest('Missing budget ID')];

        const parsedId = Number(id);
        if (isNaN(parsedId) || parsedId <= 0) {
            return [CustomError.badRequest('The Budget ID must be a valid positive integer')];
        }

        if(!userId || isNaN(userId)){
            return [CustomError.badRequest('userId is missing or invalid')];
        }

        return [undefined, new GetBudgetByIdDto(parsedId, userId)];
    }
}