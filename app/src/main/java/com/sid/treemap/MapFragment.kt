/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */

package com.sid.treemap

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.sid.treemap.databinding.MapBinding
import org.osmdroid.api.IMapController
import org.osmdroid.config.Configuration
import org.osmdroid.library.BuildConfig
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.overlay.ItemizedIconOverlay
import org.osmdroid.views.overlay.OverlayItem

class MapFragment : Fragment() {
	private lateinit var binding: MapBinding
	private lateinit var mapController: IMapController
	private lateinit var utils: Utils
	private lateinit var databaseHelper: DatabaseHelper

	private val takeImageLauncher =
		registerForActivityResult(ActivityResultContracts.TakePicture()) {
			Utils.takingImage.value = it
		}

	private val pickImageLauncher =
		registerForActivityResult(ActivityResultContracts.GetContent()) {
			Utils.pickingImage.value = it
		}

	override fun onCreateView(
		inflater: LayoutInflater,
		container: ViewGroup?,
		savedInstanceState: Bundle?,
	): View {
		super.onCreateView(inflater, container, savedInstanceState)
		binding = MapBinding.inflate(inflater, container, false)

		databaseHelper = DatabaseHelper(requireContext(), "TreeMap.sqlite", null, 1)
		Main.latText.observe(viewLifecycleOwner) { lat ->
			Main.lngText.observe(viewLifecycleOwner) { lng ->
				utils =
					Utils(requireContext(), this, lat, lng, takeImageLauncher, pickImageLauncher)
			}
		}

		Configuration.getInstance().userAgentValue = BuildConfig.LIBRARY_PACKAGE_NAME
		binding.map.setTileSource(TileSourceFactory.MAPNIK)
		binding.map.setMultiTouchControls(true)
		mapController = binding.map.controller
		mapController.setZoom(20.0)

		Main.latText.observe(viewLifecycleOwner) { lat ->
			Main.lngText.observe(viewLifecycleOwner) { lng ->
				mapController.setCenter(GeoPoint(lat.toDouble(), lng.toDouble()))
				binding.map.overlays.add(
					ItemizedIconOverlay(
						requireContext(),
						listOf(OverlayItem(
							"My Location",
							"Current Location",
							GeoPoint(lat.toDouble(), lng.toDouble())
						).apply {
							setMarker(
								ContextCompat.getDrawable(
									requireContext(), R.drawable.my_location
								)
							)
						}),
						null
					)
				)
				addMarkers()
			}
		}

		binding.map.setOnLongClickListener {
			refreshMap()
			true
		}

		return binding.root
	}

	private fun addMarkers() {
		val cursor = databaseHelper.query("SELECT * FROM TreeMap")
		val overlayItems = ArrayList<OverlayItem>()

		while (cursor.moveToNext()) overlayItems.add(
			OverlayItem(
				cursor.getString(3),
				cursor.getString(4),
				GeoPoint(cursor.getString(1).toDouble(), cursor.getString(2).toDouble())
			).apply { setMarker(ContextCompat.getDrawable(requireContext(), R.drawable.marker)) }
		)
		cursor.close()

		binding.map.overlays.add(
			ItemizedIconOverlay(
				requireContext(),
				overlayItems,
				object : ItemizedIconOverlay.OnItemGestureListener<OverlayItem> {
					override fun onItemLongPress(index: Int, item: OverlayItem?): Boolean = false
					override fun onItemSingleTapUp(index: Int, item: OverlayItem?): Boolean {
						utils.showDialog(binding.root, databaseHelper, Utils.Mode.Edit, index + 1)
						refreshMap()

						return true
					}
				}
			))
		binding.map.invalidate()
	}

	private fun refreshMap() {
		binding.map.overlays.clear()
		binding.map.invalidate()

		addMarkers()
	}

	override fun onDestroy() {
		super.onDestroy()

		binding.map.overlays.clear()
		binding.map.invalidate()

		databaseHelper.close()
	}
}
