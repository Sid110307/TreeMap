/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteDatabase.CursorFactory
import android.database.sqlite.SQLiteOpenHelper

class DatabaseHelper(context: Context?, name: String?, factory: CursorFactory?, version: Int) :
	SQLiteOpenHelper(context, name, factory, version) {
	override fun onCreate(db: SQLiteDatabase) {
		db.execSQL(
			"CREATE TABLE IF NOT EXISTS TreeMap (ID INTEGER PRIMARY KEY AUTOINCREMENT, " +
					"latitude VARCHAR, longitude VARCHAR, title VARCHAR, description VARCHAR, image " +
					"BLOB, timestamp VARCHAR)"
		)
	}

	override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
		db.execSQL("DROP TABLE IF EXISTS TreeMap")
		onCreate(db)
	}

	fun insertData(
		title: String,
		description: String,
		image: ByteArray,
		lat: String,
		lng: String,
		timestamp: String,
	) {
		val database = writableDatabase
		val statement = database.compileStatement(
			"INSERT INTO TreeMap (latitude, longitude, title, description, image, timestamp) " +
					"VALUES (?, ?, ?, ?, ?, ?)"
		)

		statement.clearBindings()
		statement.bindString(1, lat)
		statement.bindString(2, lng)
		statement.bindString(3, title)
		statement.bindString(4, description)
		statement.bindBlob(5, image)
		statement.bindString(6, timestamp)

		statement.executeInsert()
	}

	fun editData(id: Int, title: String, description: String, image: ByteArray, timestamp: String) {
		val database = writableDatabase
		val statement = database.compileStatement(
			"UPDATE TreeMap SET title = ?, description = ?, image = ?, timestamp = ? WHERE ID = ?"
		)

		statement.clearBindings()
		statement.bindString(1, title)
		statement.bindString(2, description)
		statement.bindBlob(3, image)
		statement.bindString(4, timestamp)
		statement.bindDouble(5, id.toDouble())

		query("SELECT * FROM TreeMap")
		statement.executeInsert()
	}

	fun deleteData(id: Int) {
		val database = writableDatabase
		val statement = database.compileStatement("DELETE FROM TreeMap WHERE ID = ?")

		statement.clearBindings()
		statement.bindDouble(1, id.toDouble())
		statement.executeInsert()

		database.execSQL("DELETE FROM SQLITE_SEQUENCE WHERE NAME = 'TreeMap'")
		val cursor = query("SELECT * FROM TreeMap")
		var i = 1

		while (cursor.moveToNext()) {
			val idStatement = database.compileStatement("UPDATE TreeMap SET ID = ? WHERE ID = ?")
			idStatement.clearBindings()
			idStatement.bindDouble(1, i.toDouble())
			idStatement.bindDouble(2, cursor.getInt(0).toDouble())
			idStatement.executeInsert()

			i++
		}
	}

	fun query(sql: String): Cursor = readableDatabase.rawQuery(sql, null)
}
