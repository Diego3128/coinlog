import { CustomError } from '../../errors/CustomError';

export class CreateBudgetDto {
    private constructor(
        public readonly name: string,
        public readonly amount: number
    ) { }

    static create(object: { [key: string]: any } = {}): [CustomError?, CreateBudgetDto?] {
        const { name, amount } = object;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return [CustomError.badRequest('Name is required and must be a non-empty string')];
        }

        if(typeof name === "string" && name.length > 255){
            return [CustomError.badRequest("Name must be less than 255 characters")];
        }

        if (amount === undefined || amount === null) {
            return [CustomError.badRequest('Amount is required')];
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return [CustomError.badRequest('Amount must be a valid positive number')];
        }

        return [undefined, new CreateBudgetDto(name.trim(), parsedAmount)];
    }
};