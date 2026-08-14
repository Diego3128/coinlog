import { CustomError } from "../../errors/CustomError";

export class GetExpenseByIdDto {
  private constructor(public readonly id: number) {}

  static create(
    object: { [key: string]: any } = {},
  ): [CustomError?, GetExpenseByIdDto?] {
    const { id } = object;
    const parsedId = Number(id);

    if (isNaN(parsedId) || parsedId <= 0) {
      return [
        CustomError.badRequest(
          "Invalid expense ID. It must be a positive integer.",
        ),
      ];
    }

    return [undefined, new GetExpenseByIdDto(parsedId)];
  }
}
