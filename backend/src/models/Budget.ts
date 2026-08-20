import { Table, Model, Column, DataType, HasMany, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Optional } from "sequelize";
import Expense from "./Expense";
import User from "./User";

// Interface with all table columns
export interface BudgetAttributes {
  id: number;
  name: string;
  amount: number;
  expenses?: Expense[];
  user?: User;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creation (id is optional. auto-generated)
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

  @HasMany(()=> Expense, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  expenses?: Expense[]

  @ForeignKey(() => User)
  @Column({
    field: "userId",
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user?: User;

}

export default Budget;