import type { Options as Sequelize6Options } from "sequelize";
import { Sequelize as Sequelize6 } from "sequelize";
import type {
  Options as Sequelize7Options,
  Sequelize as Sequelize7,
} from "@sequelize/core";
import { wrapOptions } from "./wrap-options";
import { CiDbConfigs } from "./ci-db-configs";
import { log } from "./logging";

export function createSequelize6Instance(
  options?: Sequelize6Options
): Sequelize6 {
  return new Sequelize6(wrapOptions(options));
}

function wrapOptionsV7(options: Partial<Sequelize7Options<any>> = {}) {
  if (!process.env.DIALECT) {
    throw new Error("Dialect is not defined! Aborting.");
  }

  const isPostgresNative = process.env.DIALECT === "postgres-native";
  const dialect = isPostgresNative ? "postgres" : process.env.DIALECT;

  // Get the CI config for this dialect
  const config = CiDbConfigs[dialect as keyof typeof CiDbConfigs] as any;

  // Transform Sequelize v6-style options to v7-style
  const transformedConfig = { ...config };
  if (transformedConfig.username) {
    transformedConfig.user = transformedConfig.username;
    delete transformedConfig.username;
  }

  const finalOptions = {
    dialect: dialect,
    logging: log,
    ...transformedConfig,
    ...options,
  };

  if (isPostgresNative) {
    finalOptions.native = true;
  }

  return finalOptions;
}

export function createSequelize7Instance(
  options?: Sequelize7Options<any>
): Sequelize7 {
  // not compatible with node 10
  const { Sequelize: Sequelize7Constructor } = require("@sequelize/core");
  return new Sequelize7Constructor(wrapOptionsV7(options));
}
