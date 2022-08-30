/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

data class ListData(
	var lat: String,
	var lng: String,
	var title: String,
	var desc: String,
	var image: ByteArray,
	var timestamp: String
) {
	override fun equals(other: Any?): Boolean {
		if (this === other) return true
		if (javaClass != other?.javaClass) return false
		other as ListData

		if (lat != other.lat) return false
		if (lng != other.lng) return false
		if (title != other.title) return false
		if (desc != other.desc) return false
		if (!image.contentEquals(other.image)) return false
		if (timestamp != other.timestamp) return false

		return true
	}

	override fun hashCode(): Int {
		var result = lat.hashCode()

		result = 31 * result + lng.hashCode()
		result = 31 * result + title.hashCode()
		result = 31 * result + desc.hashCode()
		result = 31 * result + image.contentHashCode()
		result = 31 * result + timestamp.hashCode()

		return result
	}
}