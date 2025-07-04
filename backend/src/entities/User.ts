import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Diligence } from "./Diligence";
import { Notification } from "./Notification";
import { Payment } from "./Payment";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "client",
  })
  role!: "admin" | "client" | "correspondent";

  @Column({
    type: "varchar",
    length: 20,
    default: "pending",
  })
  status!: "active" | "pending" | "inactive" | "suspended" | "rejected";

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  oab?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  cnpj?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: false })
  verified!: boolean;

  @Column("simple-array", { nullable: true })
  specialties?: string[];

  @Column("simple-array", { nullable: true })
  coverage?: string[];

  @Column({ type: "float", nullable: true })
  rating?: number;

  @Column({ nullable: true })
  totalDiligences?: number;

  @Column({ type: "float", nullable: true })
  completionRate?: number;

  @Column({ type: "float", nullable: true })
  responseTime?: number;

  @OneToMany(() => Diligence, (diligence) => diligence.client)
  clientDiligences!: Diligence[];

  @OneToMany(() => Diligence, (diligence) => diligence.correspondent)
  correspondentDiligences!: Diligence[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Payment, (payment) => payment.client)
  clientPayments!: Payment[];

  @OneToMany(() => Payment, (payment) => payment.correspondent)
  correspondentPayments!: Payment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

