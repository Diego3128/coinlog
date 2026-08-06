import { Table, Model, Column, DataType, HasOne, BelongsTo } from "sequelize-typescript";

@Table({
    tableName: 'budgets'
})
class Budget extends Model {
    @Column({
        field: 'name',
        allowNull: false,
        type: DataType.STRING(255)
    })
    name: string;

    @Column({
        field: 'amount',
        allowNull: false,
        type: DataType.DECIMAL
    })
    amount: number
};

export default Budget;