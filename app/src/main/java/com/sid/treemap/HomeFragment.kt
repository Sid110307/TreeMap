/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.AdapterView.OnItemClickListener
import android.widget.ListView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.google.android.material.snackbar.Snackbar
import com.sid.treemap.databinding.HomeBinding
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

class HomeFragment : Fragment() {
	private lateinit var binding: HomeBinding
	private lateinit var utils: Utils
	private lateinit var databaseHelper: DatabaseHelper

	private var adapter: ListDataAdapter? = null

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
		binding = HomeBinding.inflate(layoutInflater)

		databaseHelper = DatabaseHelper(requireContext(), "TreeMap.sqlite", null, 1)
		Main.latText.observe(viewLifecycleOwner) { lat ->
			binding.latDisplay.text = lat
			Main.lngText.observe(viewLifecycleOwner) { lng ->
				binding.lngDisplay.text = lng
				utils =
					Utils(requireContext(), this, lat, lng, takeImageLauncher, pickImageLauncher)
			}
		}

		binding.list.emptyView = binding.empty
		binding.list.invalidateViews()
		binding.list.refreshDrawableState()

		binding.listNearby.invalidateViews()
		binding.listNearby.refreshDrawableState()

		viewData()
		binding.listNear.setOnClickListener(::viewNearbyObjects)
		binding.save.setOnClickListener {
			utils.showDialog(it, databaseHelper, Utils.Mode.Add)
			viewData()
		}

		setupListListeners(binding.list)
		setupListListeners(binding.listNearby)

		return binding.root
	}

	private fun setupListListeners(listView: ListView) {
		listView.onItemClickListener = OnItemClickListener { v, _, position, _ ->
			utils.showDialog(v, databaseHelper, Utils.Mode.Edit, position + 1)
			viewData()
		}

		listView.onItemLongClickListener =
			AdapterView.OnItemLongClickListener { v, _, position, _ ->
				utils.showDialog(v, databaseHelper, Utils.Mode.Delete, position + 1)
				viewData()
				true
			}
	}

	private fun viewData() {
		val data: MutableList<ListData> = ArrayList()

		val cursor = databaseHelper.query("SELECT * FROM TreeMap")
		adapter = ListDataAdapter(requireContext(), R.layout.list, data)
		binding.list.adapter = adapter

		try {
			while (cursor.moveToNext()) {
				data.add(
					ListData(
						cursor.getString(1),
						cursor.getString(2),
						cursor.getString(3),
						cursor.getString(4),
						cursor.getString(5),
						cursor.getString(6)
					)
				)
				adapter!!.notifyDataSetChanged()
			}
		} catch (e: Exception) {
			e.printStackTrace()
		}

		cursor.close()
	}

	private fun viewNearbyObjects(v: View?) {
		val nearbyData: MutableList<ListData> = ArrayList()
		val nearbyAdapter = ListDataAdapter(requireContext(), R.layout.list, nearbyData)
		binding.listNearby.adapter = nearbyAdapter

		if (adapter!!.count > 0) for (i in 0..<adapter!!.count) {
			val currentLat = binding.latDisplay.text.toString().trim().toDouble()
			val currentLng = binding.lngDisplay.text.toString().trim().toDouble()

			val listLat = adapter!!.getItem(i)!!.lat.toDouble()
			val listLng = adapter!!.getItem(i)!!.lng.toDouble()

			if (objectDistance(currentLat, listLat, currentLng, listLng) <= 10) {
				requireActivity().findViewById<View>(R.id.nearbyObjectsText).visibility =
					View.VISIBLE
				requireActivity().findViewById<View>(R.id.listNearby).visibility =
					View.VISIBLE

				nearbyData.add(
					ListData(
						adapter!!.getItem(i)!!.lat,
						adapter!!.getItem(i)!!.lng,
						adapter!!.getItem(i)!!.title,
						adapter!!.getItem(i)!!.description,
						adapter!!.getItem(i)!!.image,
						adapter!!.getItem(i)!!.timestamp
					)
				)

				nearbyAdapter.notifyDataSetChanged()
			} else Snackbar.make(v!!, "No nearby objects", Snackbar.LENGTH_SHORT).show()
		} else Snackbar.make(v!!, "No objects saved", Snackbar.LENGTH_SHORT).show()
	}

	private fun objectDistance(lat1: Double, lat2: Double, lng1: Double, lng2: Double): Double {
		val phi1 = Math.toRadians(lat1)
		val phi2 = Math.toRadians(lat2)
		val deltaPhi = Math.toRadians(lat2 - lat1)
		val deltaLambda = Math.toRadians(lng2 - lng1)

		val a = sin(deltaPhi / 2).pow(2) + cos(phi1) * cos(phi2) * sin(deltaLambda / 2).pow(2)
		return floor(6371000 * 2 * atan2(sqrt(a), sqrt(1 - a)))
	}

	override fun onDestroy() {
		super.onDestroy()
		databaseHelper.close()
	}
}
