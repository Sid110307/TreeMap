/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */

package com.sid.treemap

import android.annotation.SuppressLint
import android.graphics.BitmapFactory
import android.location.Location
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Task
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.sid.treemap.databinding.MapBinding

class MapFragment : Fragment() {
	private var dialog: AlertDialog? = null
	private var databaseHelper: DatabaseHelper? = null
	private var mapView: LinearLayout? = null

	override fun onCreateView(
		inflater: LayoutInflater,
		container: ViewGroup?,
		savedInstanceState: Bundle?,
	): View {
		super.onCreateView(inflater, container, savedInstanceState)
		val binding = MapBinding.inflate(layoutInflater)

		databaseHelper = DatabaseHelper(requireContext(), "TreeMap.sqlite", null, 1)
		mapView = binding.mapView

		getCurrentLocation(mapView!!)
		viewData(binding.root)
		return binding.root
	}

	@SuppressLint("MissingPermission")
	private fun getCurrentLocation(mapView: LinearLayout) {
		LocationServices.getFusedLocationProviderClient(requireContext()).lastLocation.addOnCompleteListener { task: Task<Location> ->
			try {
				val location = task.result
				if (location != null) {
					val imageView = ImageView(context)
					imageView.layoutParams = ViewGroup.LayoutParams(
						ViewGroup.LayoutParams.WRAP_CONTENT,
						ViewGroup.LayoutParams.WRAP_CONTENT
					)

					imageView.x = location.latitude.toFloat()
					imageView.y = location.longitude.toFloat()

					imageView.setImageResource(R.drawable.my_location)
					imageView.layoutParams.height = 100
					imageView.layoutParams.width = 100

					mapView.addView(imageView)
				}
			} catch (e: Exception) {
				e.printStackTrace()
			}
		}
	}

	private fun viewData(v: View) {
		val progressDialog = ProgressBar(requireContext())
		progressDialog.isIndeterminate = true
		progressDialog.setPadding(16, 16, 16, 16)
		progressDialog.layoutParams = ViewGroup.LayoutParams(
			ViewGroup.LayoutParams.WRAP_CONTENT,
			ViewGroup.LayoutParams.WRAP_CONTENT
		)

		val cursor = databaseHelper!!.query("SELECT * FROM TreeMap")
		if (cursor.count == 0) Snackbar.make(v, "No data found", Snackbar.LENGTH_LONG).show()
		else {
			dialog = MaterialAlertDialogBuilder(requireContext())
				.setView(progressDialog)
				.setCancelable(false)
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

				mapView!!.addView(imageView)
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
