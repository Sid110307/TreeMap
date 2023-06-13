/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.TextView

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

		val bmp = BitmapFactory.decodeByteArray(image1, 0, image1.size)
		view.findViewById<View>(R.id.imageLoader).visibility = View.VISIBLE

		image?.post { image.setImageBitmap(Bitmap.createBitmap(bmp)) }
		Handler(Looper.getMainLooper()).postDelayed({
			view.findViewById<View>(R.id.imageLoader).visibility = View.GONE
		}, 500)

		return view
	}
}
