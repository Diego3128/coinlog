import { Optional } from "sequelize";
import Budget from "./Budget";
import {
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";

// interface with all table columns
export interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  validationToken?: string | null;
  confirmed: boolean;
  jwt_token?: string | null; //TODO:  future ft for refresh tokens and access tokens
  profilePictureUrl?: string | null;
  budgets?: Budget[];
  createdAt?: Date;
  updatedAt?: Date;
}

// interface for creation. id is optional
export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id"
> {}

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @Column({
    field: "firstName",
    allowNull: false,
    type: DataType.STRING(255),
  })
  declare firstName: string;

  @Column({
    field: "lastName",
    allowNull: false,
    type: DataType.STRING(255),
  })
  declare lastName: string;

  @Column({
    field: "username",
    allowNull: false,
    type: DataType.STRING(255),
    unique: true,
  })
  declare username: string;

  @Column({
    field: "email",
    allowNull: false,
    type: DataType.STRING(255),
    unique: true,
  })
  declare email: string;

  @Column({
    field: "password",
    allowNull: false,
    type: DataType.STRING(255),
  })
  declare password: string;

  @Column({
    field: "validationToken",
    allowNull: true,
    type: DataType.STRING(255),
  })
  declare validationToken: string | null;

  @Default(false)
  @Column({
    field: "confirmed",
    type: DataType.BOOLEAN,
  })
  declare confirmed: boolean;

  @Column({
    field: "jwt_token",
    allowNull: true,
    type: DataType.STRING(255),
  })
  declare jwt_token: string | null;

  @Column({
    field: "profilePictureUrl",
    allowNull: true,
    type: DataType.TEXT,
  })
  declare profilePictureUrl: string | null;

  @HasMany(() => Budget, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  budgets?: Budget[];
}

export default User;
