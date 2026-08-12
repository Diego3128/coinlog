import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Optional } from "sequelize";
import Budget from "./Budget";

// Interface with all table columns
export interface ExpenseAttributes {
  id: number;
  name: string;
  amount: number;
  budget: Budget;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creation (id is optional. auto-generated)
export interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, "id"> {}

@Table({
  tableName: "expenses",
  timestamps: true,
})
export class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> {
  @Column({
    field: "name",
    allowNull: false,
    type: DataType.STRING(255),
  })
  declare name: string;

  @Column({
    field: "amount",
    allowNull: false,
    type: DataType.DECIMAL,
  })
  declare amount: number;

  @BelongsTo(()=> Budget)
  declare budget: Budget;

  @ForeignKey(()=> Budget)
  declare budgetId: number;

}

export default Expense;