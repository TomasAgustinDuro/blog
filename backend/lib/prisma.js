import "../config/env.js";
import { PrismaClient } from "@prisma/client";

/**
 * Cliente único de Prisma compartido por todos los repositorios.
 *
 * Tener una sola instancia evita abrir un pool de conexiones por repositorio
 * y concentra en este archivo la configuración del cliente (generador,
 * adapter, etc.), que es lo que cambia al migrar de versión mayor de Prisma.
 */
export const prisma = new PrismaClient();
