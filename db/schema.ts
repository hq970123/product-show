import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const products=sqliteTable('products',{id:text('id').primaryKey(),url:text('url').notNull().unique(),data:text('data').notNull(),updatedAt:text('updated_at').notNull()});
export const videos=sqliteTable('videos',{id:text('id').primaryKey(),objectKey:text('object_key').notNull(),data:text('data').notNull(),createdAt:text('created_at').notNull()});
