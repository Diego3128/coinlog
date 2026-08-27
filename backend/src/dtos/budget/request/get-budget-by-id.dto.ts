import { CustomError } from "../../../errors/CustomError";

export class GetBudgetByIdDto {
    private constructor(public readonly id: number, public readonly userId: number) { }

    static create(object: { [key: string]: any } = {}, userId: any): [CustomError?, GetBudgetByIdDto?] {
        const { budgetId :id } = object;

        if (!id) return [CustomError.badRequest('Missing budget ID')];

        const parsedId = Number(id);
        if (isNaN(parsedId) || parsedId <= 0) {
            return [CustomError.badRequest('The Budget ID must be a valid positive integer')];
        }

        const parsedUserId = parseInt(userId);
        if (!userId) {
        return [CustomError.unAuthorized(`userId is missing`)];
        }

        if (parsedUserId < 1 || isNaN(parsedUserId)) {
        return [CustomError.unAuthorized(`userId is invalid`)];
        }

        return [undefined, new GetBudgetByIdDto(parsedId, parsedUserId)];
    }
}