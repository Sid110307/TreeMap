/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */

package com.sid.treemap

import android.graphics.BitmapFactory
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.ProgressBar
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.sid.treemap.databinding.MapBinding

class MapFragment(private val latText: String?, private val lngText: String?) : Fragment() {
	private lateinit var binding: MapBinding

	private var databaseHelper: DatabaseHelper? = null
	private var dialog: AlertDialog? = null

	override fun onCreateView(
		inflater: LayoutInflater,
		container: ViewGroup?,
		savedInstanceState: Bundle?,
	): View {
		super.onCreateView(inflater, container, savedInstanceState)
		binding = MapBinding.inflate(layoutInflater)

		databaseHelper = DatabaseHelper(requireContext(), "TreeMap.sqlite", null, 1)
		viewData()

		return binding.root
	}

	private fun viewData() {
		ImageView(context).apply {
			layoutParams = ViewGroup.LayoutParams(
				ViewGroup.LayoutParams.WRAP_CONTENT,
				ViewGroup.LayoutParams.WRAP_CONTENT
			)

			x = latText?.toFloat() ?: 0f
			y = lngText?.toFloat() ?: 0f

			setImageResource(R.drawable.my_location)
			layoutParams.height = 100
			layoutParams.width = 100

			binding.mapView.addView(this)
		}

		val progressDialog = ProgressBar(requireContext())
		progressDialog.isIndeterminate = true
		progressDialog.setPadding(16, 16, 16, 16)
		progressDialog.layoutParams = ViewGroup.LayoutParams(
			ViewGroup.LayoutParams.WRAP_CONTENT,
			ViewGroup.LayoutParams.WRAP_CONTENT
		)

		val cursor = databaseHelper!!.query("SELECT * FROM TreeMap")
		if (cursor.count == 0)
			Snackbar.make(binding.root, "No data found", Snackbar.LENGTH_LONG).show()
		else {
			dialog = MaterialAlertDialogBuilder(requireContext())
				.setView(progressDialog)
				.setOnCancelListener { _ -> cursor.close() }
				.create()
			dialog?.show()

			while (cursor.moveToNext()) {
				if (cursor.isLast) {
					dialog?.dismiss()
					break
				}

				val imageView = ImageView(requireContext())
				imageView.layoutParams = ViewGroup.LayoutParams(
					ViewGroup.LayoutParams.WRAP_CONTENT,
					ViewGroup.LayoutParams.WRAP_CONTENT
				)

				imageView.x = cursor.getString(1).toFloat()
				imageView.y = cursor.getString(2).toFloat()

				val img = cursor.getBlob(5)
				if (img == null) {
					imageView.setImageResource(R.drawable.help)
					imageView.layoutParams.height = 100
					imageView.layoutParams.width = 100
				} else imageView.setImageBitmap(BitmapFactory.decodeByteArray(img, 0, img.size))

				binding.mapView.addView(imageView)
			}
		}
	}

	override fun onPause() {
		super.onPause()
		dialog?.dismiss()
	}

	override fun onResume() {
		super.onResume()
		dialog?.show()
	}
}
