import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  Index,
} from "sequelize-typescript";
import { Optional } from "sequelize";
import User from "./User";

export interface RefreshTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  device?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RefreshTokenCreationAttributes extends Optional<
  RefreshTokenAttributes,
  "id"
> {}

@Table({
  tableName: "refresh_tokens",
  timestamps: true,
})
export class RefreshToken extends Model<
  RefreshTokenAttributes,
  RefreshTokenCreationAttributes
> {
  @ForeignKey(() => User)
  @Index // Indexado para búsquedas veloces por usuario
  @Column({
    field: "userId",
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare userId: number;

  @Column({
    field: "tokenHash",
    allowNull: false,
    type: DataType.TEXT,
  })
  declare tokenHash: string;

  @Column({
    field: "device",
    allowNull: true,
    type: DataType.STRING(255),
  })
  declare device: string | null;

  @Column({
    field: "ipAddress",
    allowNull: true,
    type: DataType.STRING(100),
  })
  declare ipAddress: string | null;

  @Column({
    field: "expiresAt",
    allowNull: false,
    type: DataType.DATE,
  })
  declare expiresAt: Date;

  @BelongsTo(() => User)
  declare user: User;
}

export default RefreshToken;