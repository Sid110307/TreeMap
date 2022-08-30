/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

import android.Manifest
import android.annotation.SuppressLint
import android.content.DialogInterface
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.location.Location
import android.location.LocationManager
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.InputType
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.*
import android.widget.AdapterView.OnItemClickListener
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.text.HtmlCompat
import com.github.dhaval2404.imagepicker.ImagePicker
import com.google.android.gms.location.*
import com.google.android.gms.tasks.Task
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import java.io.ByteArrayOutputStream
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.abs

class Main : AppCompatActivity() {
	private var listView: ListView? = null
	private var nearbyListView: ListView? = null
	private var adapter: ListDataAdapter? = null
	private var cursor: Cursor? = null

	private var lat: TextView? = null
	private var lng: TextView? = null
	private var timestamp: String? = null
	private var imageView: ImageView? = null

	override fun onStart() {
		super.onStart()

		if (ContextCompat.checkSelfPermission(
				this,
				Manifest.permission.ACCESS_FINE_LOCATION
			) != PackageManager.PERMISSION_GRANTED
		) {
			ActivityCompat.requestPermissions(
				this, arrayOf(
					Manifest.permission.INTERNET,
					Manifest.permission.READ_EXTERNAL_STORAGE,
					Manifest.permission.ACCESS_FINE_LOCATION,
					Manifest.permission.READ_PHONE_STATE,
					Manifest.permission.MANAGE_EXTERNAL_STORAGE
				), 100
			)
			return
		}

		val locationProvider = LocationServices.getFusedLocationProviderClient(this)
		Handler(Looper.getMainLooper()).postDelayed({ getLocation(locationProvider) }, 1000)
	}

	@SuppressLint("SetTextI18n")
	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.main)

		title = "\uD83C\uDF34 TreeMap \uD83C\uDF3B"
		databaseHelper = DatabaseHelper(this, "TreeMap.sqlite", null, 1)

		lat = findViewById(R.id.latDisplay)
		lng = findViewById(R.id.lngDisplay)

		listView = findViewById(R.id.list)
		listView?.emptyView = findViewById(R.id.empty)

		nearbyListView = findViewById(R.id.listNearby)

		listView?.invalidateViews()
		listView?.refreshDrawableState()
		nearbyListView?.invalidateViews()
		nearbyListView?.refreshDrawableState()
		timestamp = SimpleDateFormat("dd/MM/yyyy hh:mm:ss a", Locale.getDefault()).format(Date())

		viewData()
		findViewById<View>(R.id.listNear).setOnClickListener { v: View? -> viewNearbyObjects(v) }
		findViewById<View>(R.id.save).setOnClickListener { v: View? -> addData(v) }

		listView?.onItemClickListener =
			OnItemClickListener { _: AdapterView<*>?, v: View?, position: Int, _: Long ->
				editData(v, position)
			}

		// if back is pressed, wait for the user to click on the back button again to exit the app
		onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
			override fun handleOnBackPressed() {
				MaterialAlertDialogBuilder(this@Main)
					.setTitle("Exit TreeMap")
					.setMessage("Are you sure you want to exit?")
					.setPositiveButton("Yes") { _: DialogInterface?, _: Int -> finish() }
					.setNegativeButton("No") { _: DialogInterface?, _: Int -> }
					.show()
			}
		})
	}

	@SuppressLint("SetTextI18n")
	fun editData(v: View?, position: Int) {
		val pos = position + 1

		try {
			val cur = databaseHelper!!.getData("SELECT * FROM `TreeMap` WHERE ID = $pos")

			if (cur.count > 0 && cur.moveToFirst()) {
				val layout = TableLayout(this)
				val textTitle = EditText(this)

				textTitle.inputType =
					InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_SUBJECT
				textTitle.setText(cur.getString(3))
				layout.addView(textTitle)

				val text = EditText(this)
				text.maxLines = 10
				text.setText(cur.getString(4))
				layout.addView(text)

				imageView = ImageView(this)
				imageView!!.setImageBitmap(
					BitmapFactory.decodeByteArray(cur.getBlob(5), 0, cur.getBlob(5).size)
				)
				imageView!!.isClickable = true
				imageView!!.layoutParams = ViewGroup.LayoutParams(100, 300)
				imageView!!.tooltipText = "Select Image"
				imageView!!.setOnClickListener { selectImage(it) }
				layout.addView(imageView)

				val compressFormatText = TextView(this)
				compressFormatText.text = "Image Compression Format:"
				layout.addView(compressFormatText)

				val compressFormatAdapter = ArrayAdapter(
					this,
					android.R.layout.simple_spinner_item,
					arrayOf(
						"Auto",
						"JPEG (Very small file size, Normal image quality)",
						"PNG (Compressed image, Small file size, Good image quality)",
						"Lossy Bitmap (Small file size, Considerable image quality)",
						"Lossless Bitmap (Medium file size, Normal image quality)"
					)
				)
				compressFormatAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

				val compressFormat = Spinner(this)
				compressFormat.adapter = compressFormatAdapter
				layout.addView(compressFormat)

				MaterialAlertDialogBuilder(this)
					.setTitle("Edit Object Info:")
					.setView(layout)
					.setCancelable(false)
					.setPositiveButton("Save") { _: DialogInterface?, _: Int ->
						if (textTitle.text.toString().trim().isEmpty()) {
							Snackbar.make(v!!, "Please enter a title.", Snackbar.LENGTH_SHORT)
								.show()
							return@setPositiveButton
						}
						if (text.text.toString().trim() == "") text.setText("No Information")

						val drawable = imageView!!.drawable
						val bitmap = Bitmap.createBitmap(
							drawable.intrinsicWidth,
							drawable.intrinsicHeight,
							Bitmap.Config.ARGB_8888
						)

						val canvas = Canvas(bitmap)
						drawable.setBounds(0, 0, canvas.width, canvas.height)
						drawable.draw(canvas)

						val stream = ByteArrayOutputStream()
						when (compressFormat.selectedItemPosition) {
							2 -> bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
							3 -> bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSY, 100, stream)
							4 -> bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSLESS, 100, stream)
							else -> bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)
						}
						val img = stream.toByteArray()
						timestamp =
							SimpleDateFormat("dd/MM/yyyy hh:mm:ss a", Locale.getDefault()).format(
								Date()
							)
						databaseHelper!!.editData(
							pos,
							textTitle.text.toString().trim(),
							text.text.toString().trim(),
							img,
							"$timestamp (edited)"
						)

						try {
							stream.close()
						} catch (e: Exception) {
							e.printStackTrace()
						}

						Snackbar.make(
							v!!,
							"Edited\nRefreshing list, Please wait...",
							Snackbar.LENGTH_SHORT
						).show()
						Handler(Looper.getMainLooper()).postDelayed({
							finish()
							startActivity(intent)
						}, 3000)
					}
					.setNegativeButton("Cancel", null)
					.create().show()
			} else {
				Snackbar.make(
					v!!,
					"Error: Cannot get object at position $pos",
					Snackbar.LENGTH_INDEFINITE
				).also { snackbar -> snackbar.setAction("Dismiss") { snackbar.dismiss() }.show() }
			}
		} catch (e: Exception) {
			e.printStackTrace()

			Snackbar.make(
				v!!,
				"Error: ${e.message}",
				Snackbar.LENGTH_INDEFINITE
			).also { snackbar -> snackbar.setAction("Dismiss") { snackbar.dismiss() }.show() }
		}
	}

	private fun viewData() {
		databaseHelper!!.query("CREATE TABLE IF NOT EXISTS `TreeMap` (ID INTEGER PRIMARY KEY AUTOINCREMENT, latitude VARCHAR, longitude VARCHAR, title VARCHAR, desc VARCHAR, image VARCHAR, timestamp VARCHAR)")
		val data: MutableList<ListData> = ArrayList()

		cursor = databaseHelper!!.getData("SELECT * FROM `TreeMap`")
		adapter = ListDataAdapter(this, R.layout.list, data)
		listView!!.adapter = adapter

		try {
			while (cursor!!.moveToNext()) {
				data.add(
					ListData(
						cursor!!.getString(1),
						cursor!!.getString(2),
						cursor!!.getString(3),
						cursor!!.getString(4),
						cursor!!.getBlob(5),
						cursor!!.getString(6)
					)
				)
				adapter!!.notifyDataSetChanged()
			}
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}

	// FIXME: Fix nearby objects finding
	private fun viewNearbyObjects(v: View?) {
		val nearbyData: MutableList<ListData> = ArrayList()
		val nearbyAdapter = ListDataAdapter(this, R.layout.list, nearbyData)
		nearbyListView!!.adapter = nearbyAdapter

		if (adapter!!.count > 0) for (i in 0..adapter!!.count) try {
			val currentLat = lat!!.text.toString().trim().toFloat()
			val currentLng = lng!!.text.toString().trim().toFloat()

			val listLat = adapter!!.getItem(i)!!.lat.toDouble()
			val listLng = adapter!!.getItem(i)!!.lng.toDouble()

			if (abs(currentLat - listLat) <= 1 / 10000000f && abs(currentLng - listLng) >= 1 / 10000000f) {
				findViewById<View>(R.id.nearbyObjectsText).visibility = View.VISIBLE
				findViewById<View>(R.id.listNearby).visibility = View.VISIBLE

				nearbyData.add(
					ListData(
						adapter!!.getItem(i)!!.lat,
						adapter!!.getItem(i)!!.lng,
						adapter!!.getItem(i)!!.title,
						adapter!!.getItem(i)!!.desc,
						adapter!!.getItem(i)!!.image,
						adapter!!.getItem(i)!!.timestamp
					)
				)
			} else Snackbar.make(v!!, "No nearby objects", Snackbar.LENGTH_SHORT).show()

			nearbyAdapter.notifyDataSetChanged()
		} catch (e: Exception) {
			e.printStackTrace()
		} else Snackbar.make(v!!, "No objects saved", Snackbar.LENGTH_SHORT).show()
	}

	@SuppressLint("SetTextI18n")
	fun addData(v: View?) {
		val layout = TableLayout(this)
		val textTitle = EditText(this)

		textTitle.inputType =
			InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_SUBJECT
		textTitle.hint = HtmlCompat.fromHtml(
			"Title <strong>(Required)</strong>",
			HtmlCompat.FROM_HTML_MODE_COMPACT
		)
		layout.addView(textTitle)

		val text = EditText(this)
		text.maxLines = 10
		text.hint = "Information"
		layout.addView(text)

		imageView = ImageView(this)
		imageView!!.setImageResource(R.drawable.camera)
		imageView!!.isClickable = true
		imageView!!.layoutParams = ViewGroup.LayoutParams(100, 300)
		imageView!!.tooltipText = "Select Image"
		imageView!!.setOnClickListener { selectImage(it) }
		layout.addView(imageView)

		val compressFormatText = TextView(this)
		compressFormatText.text = "Image Compression Format:"
		layout.addView(compressFormatText)

		val compressFormatAdapter = ArrayAdapter(
			this,
			android.R.layout.simple_spinner_item,
			arrayOf(
				"Auto",
				"JPEG (Very small file size, Normal image quality)",
				"PNG (Compressed image, Small file size, Good image quality)",
				"Lossy Bitmap (Small file size, Considerable image quality)",
				"Lossless Bitmap (Medium file size, Normal image quality)"
			)
		)
		compressFormatAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

		val compressFormat = Spinner(this)
		compressFormat.adapter = compressFormatAdapter
		layout.addView(compressFormat)

		MaterialAlertDialogBuilder(this)
			.setTitle("Save Object Info:")
			.setView(layout)
			.setCancelable(false)
			.setPositiveButton("Save") { _: DialogInterface?, _: Int ->
				if (textTitle.text.toString().trim().isEmpty()) {
					Snackbar.make(v!!, "Please enter a title.", Snackbar.LENGTH_SHORT).show()
					return@setPositiveButton
				}
				if (text.text.toString().trim() == "") text.setText("No Information")

				val drawable = imageView!!.drawable
				val bitmap = Bitmap.createBitmap(
					drawable.intrinsicWidth,
					drawable.intrinsicHeight,
					Bitmap.Config.ARGB_8888
				)

				val canvas = Canvas(bitmap)
				drawable.setBounds(0, 0, canvas.width, canvas.height)
				drawable.draw(canvas)

				val stream = ByteArrayOutputStream()
				when (compressFormat.selectedItemPosition) {
					2 -> bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
					3 -> bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSY, 100, stream)
					4 -> bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSLESS, 100, stream)
					else -> bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)
				}

				val img = stream.toByteArray()
				databaseHelper!!.insertData(
					textTitle.text.toString().trim(),
					text.text.toString().trim(),
					img,
					lat!!.text.toString().trim(),
					lng!!.text.toString().trim(),
					timestamp!!
				)

				try {
					stream.close()
				} catch (e: Exception) {
					e.printStackTrace()
				}

				Snackbar.make(v!!, "Saved\nRefreshing list, Please wait...", Snackbar.LENGTH_SHORT)
					.show()
				Handler(Looper.getMainLooper()).postDelayed({
					finish()
					startActivity(intent)
				}, 3000)
			}
			.setNegativeButton("Cancel", null)
			.create().show()
	}

	@SuppressLint("MissingPermission")
	fun getLocation(locationProvider: FusedLocationProviderClient) {
		val locationManager = getSystemService(LOCATION_SERVICE) as LocationManager

		if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) || locationManager.isProviderEnabled(
				LocationManager.NETWORK_PROVIDER
			)
		) locationProvider.lastLocation.addOnCompleteListener { task: Task<Location> ->
			val location = task.result

			lat!!.text = location.latitude.toString()
			lng!!.text = location.longitude.toString()
		} else {
			val request = LocationRequest.create()
				.setWaitForAccurateLocation(true)
				.setInterval(10000)
				.setFastestInterval(1000)
				.setNumUpdates(1)

			val callback: LocationCallback = object : LocationCallback() {
				override fun onLocationResult(locationResult: LocationResult) {
					val loc = locationResult.lastLocation

					lat!!.text = loc!!.latitude.toString()
					lng!!.text = loc.longitude.toString()
				}
			}

			locationProvider.requestLocationUpdates(request, callback, Looper.myLooper())
			MaterialAlertDialogBuilder(this)
				.setTitle("Enable Location")
				.setMessage("Your Location Service is not enabled.\nClick the below button to enable it.")
				.setPositiveButton("Enable Location") { _: DialogInterface?, _: Int ->
					startActivity(
						Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
							.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
					)
				}
				.create().show()
		}
	}

	override fun onRequestPermissionsResult(
		code: Int,
		perms: Array<String>,
		grantResults: IntArray
	) {
		super.onRequestPermissionsResult(code, perms, grantResults)

		if (grantResults.isEmpty() || grantResults[2] != PackageManager.PERMISSION_GRANTED)
			MaterialAlertDialogBuilder(this)
				.setTitle("Permissions")
				.setCancelable(false)
				.setMessage("This app may not work without all permissions.\nPlease Allow all permissions.")
				.setPositiveButton("Go to Settings") { _: DialogInterface?, _: Int ->
					finish()
					startActivity(
						Intent(
							Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
							Uri.parse("package:$packageName")
						)
					)
				}
				.setNegativeButton("Cancel") { _: DialogInterface?, _: Int -> finish() }
				.create().show()
	}

	@Deprecated("Deprecated in Java")
	override fun onActivityResult(requestCode: Int, result: Int, data: Intent?) {
		super.onActivityResult(requestCode, result, data)

		try {
			if (result == RESULT_OK) setImage(imageView, data)
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}

	private fun selectImage(v: View?) {
		ImagePicker.with(this).compress(512).start()
		Snackbar.make(v!!, "Please Wait...", Snackbar.LENGTH_SHORT).show()
	}

	private fun setImage(view: ImageView?, data: Intent?) {
		try {
			view!!.setImageBitmap(BitmapFactory.decodeStream(contentResolver.openInputStream(data!!.data!!)))
		} catch (e: Exception) {
			Snackbar.make(view!!, "Error: ${e.message}", Snackbar.LENGTH_LONG).show()
			e.printStackTrace()
		}
	}

	override fun onCreateOptionsMenu(menu: Menu): Boolean {
		menuInflater.inflate(R.menu.menu, menu)
		return true
	}

	override fun onOptionsItemSelected(item: MenuItem): Boolean {
		when (item.itemId) {
			R.id.refresh -> {
				finish()
				startActivity(intent)
			}
			R.id.howToUse -> {
				MaterialAlertDialogBuilder(this)
					.setTitle("How to Use")
					.setMessage(
						HtmlCompat.fromHtml(
							resources.getString(R.string.usage),
							HtmlCompat.FROM_HTML_MODE_COMPACT
						)
					)
					.setIcon(R.drawable.help)
					.setNegativeButton("Ok", null)
					.create().show()
				return true
			}
		}

		return super.onOptionsItemSelected(item)
	}

	companion object {
		var databaseHelper: DatabaseHelper? = null
	}
}