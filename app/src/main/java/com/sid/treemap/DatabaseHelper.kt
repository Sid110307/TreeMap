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
	override fun onCreate(db: SQLiteDatabase) {}
	override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {}
	fun query(sql: String) = writableDatabase.execSQL(sql)

	fun insertData(
		title: String,
		desc: String,
		image: ByteArray,
		lat: String,
		lng: String,
		timestamp: String
	) {
		val database = writableDatabase
		val statement =
			database.compileStatement("INSERT INTO `TreeMap` VALUES (NULL, ?, ?, ?, ?, ?, ?)")

		statement.clearBindings()
		statement.bindString(1, lat)
		statement.bindString(2, lng)
		statement.bindString(3, title)
		statement.bindString(4, desc)
		statement.bindBlob(5, image)

		statement.bindString(6, timestamp)
		statement.executeInsert()
	}

	fun editData(id: Int, title: String, desc: String, image: ByteArray, timestamp: String) {
		val database = writableDatabase
		val statement =
			database.compileStatement("UPDATE `TreeMap` SET title = ?, `desc` = ?, image = ?, timestamp = ? WHERE ID = ?")

		statement.clearBindings()
		statement.bindString(1, title)
		statement.bindString(2, desc)
		statement.bindBlob(3, image)
		statement.bindString(4, timestamp)
		statement.bindDouble(5, id.toDouble())

		getData("SELECT * FROM `TreeMap`")
		statement.executeInsert()
	}

	fun getData(sql: String): Cursor = readableDatabase.rawQuery(sql, null)
}