import { pipe, string, length, trim, number, transform } from "valibot";

export const TokenSchema = pipe(
    string("The token must be a string"),
    trim(),
    length(6, "The token must be 6 characters long"),
    transform((v)=> parseInt(v)),
    number("The token must be a valid integer number")
    
)