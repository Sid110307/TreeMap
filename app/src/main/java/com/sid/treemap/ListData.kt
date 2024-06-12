/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

import android.content.Context
import android.graphics.BitmapFactory
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.TextView

data class ListData(
	var lat: String,
	var lng: String,
	var title: String,
	var description: String,
	var image: ByteArray,
	var timestamp: String,
) {
	override fun equals(other: Any?): Boolean {
		if (this === other) return true
		if (javaClass != other?.javaClass) return false
		other as ListData

		if (lat != other.lat) return false
		if (lng != other.lng) return false
		if (title != other.title) return false
		if (description != other.description) return false
		if (!image.contentEquals(other.image)) return false
		if (timestamp != other.timestamp) return false

		return true
	}

	override fun hashCode(): Int {
		var result = lat.hashCode()

		result = 31 * result + lng.hashCode()
		result = 31 * result + title.hashCode()
		result = 31 * result + description.hashCode()
		result = 31 * result + image.contentHashCode()
		result = 31 * result + timestamp.hashCode()

		return result
	}
}

class ListDataAdapter(ctx: Context, private val resource: Int, private val list: List<ListData>) :
	ArrayAdapter<ListData?>(ctx, resource, list) {
	override fun getView(pos: Int, convertView: View?, parent: ViewGroup): View {
		val view = convertView ?: LayoutInflater.from(context).inflate(resource, parent, false)

		val lat = view.findViewById<TextView>(R.id.latTxt)
		val lng = view.findViewById<TextView>(R.id.lngTxt)

		val title = view.findViewById<TextView>(R.id.titleTxt)
		val description = view.findViewById<TextView>(R.id.descriptionTxt)
		val image = view.findViewById<ImageView>(R.id.listImage)
		val (lat1, lng1, title1, desc1, image1, timestamp) = list[pos]

		lat.text = lat1
		lng.text = lng1
		title.text = title1
		description.text = "$timestamp\n$desc1"

		view.findViewById<View>(R.id.imageLoader).visibility = View.VISIBLE
		image?.post {
			image.setImageBitmap(BitmapFactory.decodeByteArray(image1, 0, image1.size))
		}
		view.findViewById<View>(R.id.imageLoader).visibility = View.GONE

		return view
	}
}
