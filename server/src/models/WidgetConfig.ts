import { db } from "../db";
import { WidgetConfig } from "../types";

export class WidgetConfigModel {
  /**
   * Find widget config by ID
   */
  static async findById(id: number): Promise<WidgetConfig | null> {
    try {
      const config = await db("widget_configs")
        .where("id", id)
        .select(
          "id",
          "user_id as userId",
          "name",
          "config",
          "is_active as isActive",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return config || null;
    } catch (error) {
      console.error("Error finding widget config by ID:", error);
      throw error;
    }
  }

  /**
   * Get all widget configs for a user
   */
  static async findByUser(userId: number): Promise<WidgetConfig[]> {
    try {
      const configs = await db("widget_configs")
        .where("user_id", userId)
        .select(
          "id",
          "user_id as userId",
          "name",
          "config",
          "is_active as isActive",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .orderBy("created_at", "desc");

      return configs;
    } catch (error) {
      console.error("Error finding widget configs by user:", error);
      throw error;
    }
  }

  /**
   * Create a new widget config
   */
  static async create(configData: {
    userId: number;
    name: string;
    config: object;
    isActive?: boolean;
  }): Promise<WidgetConfig> {
    try {
      const [id] = await db("widget_configs").insert({
        user_id: configData.userId,
        name: configData.name,
        config: JSON.stringify(configData.config),
        is_active: configData.isActive ?? true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return this.findById(id) as Promise<WidgetConfig>;
    } catch (error) {
      console.error("Error creating widget config:", error);
      throw error;
    }
  }

  /**
   * Update widget config
   */
  static async update(
    id: number,
    configData: {
      name?: string;
      config?: object;
      isActive?: boolean;
    },
  ): Promise<WidgetConfig | null> {
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (configData.name) updateData.name = configData.name;
      if (configData.config)
        updateData.config = JSON.stringify(configData.config);
      if (configData.isActive !== undefined)
        updateData.is_active = configData.isActive;

      await db("widget_configs").where("id", id).update(updateData);

      return this.findById(id);
    } catch (error) {
      console.error("Error updating widget config:", error);
      throw error;
    }
  }

  /**
   * Delete widget config
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db("widget_configs").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting widget config:", error);
      return false;
    }
  }

  /**
   * Set a widget config as active and deactivate others
   */
  static async setActive(id: number, userId: number): Promise<boolean> {
    const trx = await db.transaction();

    try {
      // Deactivate all configs for this user
      await trx("widget_configs")
        .where("user_id", userId)
        .update({ is_active: false, updated_at: new Date() });

      // Activate the specified config
      await trx("widget_configs")
        .where("id", id)
        .update({ is_active: true, updated_at: new Date() });

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      console.error("Error setting widget config as active:", error);
      return false;
    }
  }

  /**
   * Get active widget config for a user
   */
  static async getActive(userId: number): Promise<WidgetConfig | null> {
    try {
      const config = await db("widget_configs")
        .where({
          user_id: userId,
          is_active: true,
        })
        .select(
          "id",
          "user_id as userId",
          "name",
          "config",
          "is_active as isActive",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return config || null;
    } catch (error) {
      console.error("Error getting active widget config:", error);
      throw error;
    }
  }
}
