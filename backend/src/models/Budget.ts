import { Table, Model, Column, DataType } from "sequelize-typescript";
import { Optional } from "sequelize";

// Interface with all table columns
export interface BudgetAttributes {
  id: number;
  name: string;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creaition (id is optional. auto-generated)
export interface BudgetCreationAttributes extends Optional<BudgetAttributes, "id"> {}

@Table({
  tableName: "budgets",
  timestamps: true,
})
export class Budget extends Model<BudgetAttributes, BudgetCreationAttributes> {
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
}

export default Budget;