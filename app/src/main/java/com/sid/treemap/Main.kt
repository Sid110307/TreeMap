/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */

package com.sid.treemap

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.Menu
import android.view.MenuInflater
import android.view.MenuItem
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.text.HtmlCompat
import androidx.fragment.app.Fragment
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Task
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.sid.treemap.databinding.MainBinding

class Main : AppCompatActivity() {
	private var dialog: AlertDialog? = null

	private var latText: String? = null
	private var lngText: String? = null

	@SuppressLint("MissingPermission")
	fun getLocation(locationProvider: FusedLocationProviderClient) {
		val locationManager = getSystemService(LOCATION_SERVICE) as LocationManager

		if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
			locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
		) locationProvider.lastLocation.addOnCompleteListener { task: Task<Location> ->
			val location = task.result
			latText = location.latitude.toString()
			lngText = location.longitude.toString()
		}
		else {
			dialog = MaterialAlertDialogBuilder(this).setTitle("Enable Location")
				.setMessage("Your location service is not enabled.\nClick the below button to enable it.")
				.setPositiveButton("Enable Location") { _, _ ->
					startActivity(
						Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS).setFlags(
							Intent.FLAG_ACTIVITY_NEW_TASK
						)
					)
				}
				.create()
			dialog?.show()

			locationProvider.requestLocationUpdates(
				LocationRequest.Builder(10000)
					.setWaitForAccurateLocation(true)
					.setMinUpdateIntervalMillis(10000)
					.setMaxUpdateDelayMillis(10000)
					.build(),
				object : LocationCallback() {
					override fun onLocationResult(locationResult: LocationResult) {
						super.onLocationResult(locationResult)
						locationProvider.removeLocationUpdates(this)

						val location = locationResult.lastLocation
						latText = location?.latitude.toString()
						lngText = location?.longitude.toString()
					}
				},
				Looper.myLooper()
			)
		}
	}

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		val binding = MainBinding.inflate(layoutInflater)

		setContentView(binding.root)
		setCurrentFragment(HomeFragment(latText, lngText))

		binding.tabNavigation.setOnItemSelectedListener {
			when (it.itemId) {
				R.id.home -> setCurrentFragment(HomeFragment(latText, lngText))
				R.id.map -> setCurrentFragment(MapFragment(latText, lngText))
			}

			true
		}

		onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
			override fun handleOnBackPressed() {
				dialog = MaterialAlertDialogBuilder(this@Main).setTitle("Exit TreeMap")
					.setMessage("Are you sure you want to exit?")
					.setPositiveButton("Yes") { _, _ -> finish() }
					.setNegativeButton("No") { _, _ -> dialog?.dismiss() }
					.create()
				dialog?.show()
			}
		})

		askPermissions()
		Handler(Looper.getMainLooper()).postDelayed({
			getLocation(LocationServices.getFusedLocationProviderClient(this))
		}, 1000)
	}

	private fun setCurrentFragment(fragment: Fragment) {
		supportFragmentManager.beginTransaction().replace(R.id.fragmentContainer, fragment).commit()
	}

	private fun askPermissions() {
		val permissions = arrayOf(
			Manifest.permission.CAMERA,
			Manifest.permission.INTERNET,
			Manifest.permission.READ_EXTERNAL_STORAGE,
			Manifest.permission.ACCESS_FINE_LOCATION,
			Manifest.permission.MANAGE_EXTERNAL_STORAGE
		)

		if (ContextCompat.checkSelfPermission(
				this, Manifest.permission.ACCESS_FINE_LOCATION
			) != PackageManager.PERMISSION_GRANTED
		)
			registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
				MaterialAlertDialogBuilder(this).setTitle("Permissions")
					.setMessage("Please grant all the permissions to use this app.")
					.setPositiveButton("Grant") { _, _ ->
						Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
							data = Uri.fromParts("package", packageName, null)
							startActivity(this)
						}
					}
					.create().show()
			}.launch(permissions)
	}

	override fun onCreateOptionsMenu(menu: Menu?): Boolean {
		MenuInflater(this).inflate(R.menu.menu, menu)
		return true
	}

	override fun onOptionsItemSelected(item: MenuItem): Boolean {
		when (item.itemId) {
			R.id.refresh -> {
				finish()
				startActivity(intent)

				return true
			}

			R.id.howToUse -> {
				dialog = MaterialAlertDialogBuilder(this).setTitle("How to Use")
					.setMessage(
						HtmlCompat.fromHtml(
							resources.getString(R.string.usage),
							HtmlCompat.FROM_HTML_MODE_COMPACT
						)
					)
					.setIcon(R.drawable.help)
					.setNegativeButton("Ok", null)
					.create()
				dialog?.show()

				return true
			}
		}

		return super.onOptionsItemSelected(item)
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
