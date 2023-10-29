/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Matrix
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.AdapterView.OnItemClickListener
import android.widget.EditText
import android.widget.ImageView
import android.widget.ListView
import android.widget.TableLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.text.HtmlCompat
import androidx.fragment.app.Fragment
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.sid.treemap.databinding.HomeBinding
import java.io.ByteArrayOutputStream
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.abs

data class LayoutItems(var title: String, var text: String, var image: Bitmap)

class HomeFragment(latText: String?, lngText: String?) : Fragment() {
	private var listView: ListView? = null
	private var nearbyListView: ListView? = null
	private var adapter: ListDataAdapter? = null

	private var databaseHelper: DatabaseHelper? = null

	private var lat: TextView? = null
	private var lng: TextView? = null
	private var timestamp: String? = null
	private var imageView: ImageView? = null

	private var currentPhotoUri: Uri? = null
	private var dialog: AlertDialog? = null

	private val takeImageLauncher =
		registerForActivityResult(ActivityResultContracts.TakePicture()) { success ->
			if (success) imageView?.setImageBitmap(setImageRotation(currentPhotoUri!!))
			dialog?.dismiss()
		}

	private val pickImageLauncher =
		registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
			if (uri != null) imageView?.setImageBitmap(
				BitmapFactory.decodeStream(requireContext().contentResolver.openInputStream(uri))
			)
			dialog?.dismiss()
		}

	init {
		lat?.text = latText
		lng?.text = lngText
	}

	override fun onCreateView(
		inflater: LayoutInflater,
		container: ViewGroup?,
		savedInstanceState: Bundle?,
	): View {
		super.onCreateView(inflater, container, savedInstanceState)
		val binding = HomeBinding.inflate(layoutInflater)

		databaseHelper = DatabaseHelper(requireContext(), "TreeMap.sqlite", null, 1)

		lat = binding.latDisplay
		lng = binding.lngDisplay

		listView = binding.list
		listView?.emptyView = binding.empty

		nearbyListView = binding.listNearby

		listView?.invalidateViews()
		listView?.refreshDrawableState()
		nearbyListView?.invalidateViews()
		nearbyListView?.refreshDrawableState()
		timestamp = SimpleDateFormat("dd/MM/yyyy hh:mm:ss a", Locale.getDefault()).format(Date())

		if (ContextCompat.checkSelfPermission(
				requireContext(),
				Manifest.permission.ACCESS_FINE_LOCATION
			) != PackageManager.PERMISSION_GRANTED
		) {
			registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
				var flag = true
				for (i in it.values) if (!i) flag = false

				if (!flag) {
					MaterialAlertDialogBuilder(requireContext()).setTitle("Permissions")
						.setMessage("Please grant all the permissions to use this app.")
						.setPositiveButton("OK") { _, _ ->
							val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
							intent.data =
								Uri.fromParts("package", requireContext().packageName, null)
							startActivity(intent)
						}
						.setNegativeButton("Already Granted", null)
						.create().show()
				}
			}.launch(
				arrayOf(
					Manifest.permission.CAMERA,
					Manifest.permission.INTERNET,
					Manifest.permission.READ_EXTERNAL_STORAGE,
					Manifest.permission.ACCESS_FINE_LOCATION,
					Manifest.permission.READ_PHONE_STATE,
					Manifest.permission.MANAGE_EXTERNAL_STORAGE
				)
			)
		}

		viewData()
		binding.listNear.setOnClickListener(::viewNearbyObjects)
		binding.save.setOnClickListener(::addData)

		listView?.onItemClickListener =
			OnItemClickListener { v, _, position, _ ->
				editData(v, position + 1)
			}

		listView?.onItemLongClickListener =
			AdapterView.OnItemLongClickListener { v, _, position, _ ->
				deleteData(v, position + 1)
				true
			}

		return binding.root
	}

	private fun addData(v: View?) {
		var (layout, textTitle, text) = createLayout()

		layout = layout as TableLayout
		textTitle = textTitle as EditText
		text = text as EditText

		dialog = MaterialAlertDialogBuilder(requireContext()).setTitle("Save Object Info")
			.setView(layout)
			.setCancelable(false)
			.setPositiveButton("Save") { _, _ ->
				if (textTitle.text.toString().trim().isEmpty())
					Snackbar.make(v!!, "Please enter a title.", Snackbar.LENGTH_SHORT).show()
				else {
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
					bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)

					databaseHelper!!.insertData(
						textTitle.text.toString().trim(),
						text.text.toString().trim(),
						stream.toByteArray(),
						lat!!.text.toString().trim(),
						lng!!.text.toString().trim(),
						timestamp!!
					)

					try {
						stream.close()
					} catch (e: Exception) {
						e.printStackTrace()
					}

					viewData()
					Snackbar.make(v!!, "Object saved.", Snackbar.LENGTH_SHORT).show()
				}
			}
			.setNegativeButton("Cancel", null)
			.create()
		dialog?.show()
	}

	private fun editData(v: View?, pos: Int) {
		try {
			val cur = databaseHelper!!.query("SELECT * FROM TreeMap WHERE ID = $pos")

			if (cur.count > 0 && cur.moveToFirst()) {
				var (layout, textTitle, text) = createLayout(
					LayoutItems(
						cur.getString(3),
						cur.getString(4),
						BitmapFactory.decodeByteArray(cur.getBlob(5), 0, cur.getBlob(5).size)
					)
				)

				layout = layout as TableLayout
				textTitle = textTitle as EditText
				text = text as EditText

				dialog = MaterialAlertDialogBuilder(requireContext()).setTitle("Edit Object Info")
					.setView(layout)
					.setCancelable(false)
					.setPositiveButton("Save") { _, _ ->
						if (textTitle.text.toString().trim().isEmpty())
							Snackbar.make(v!!, "Please enter a title.", Snackbar.LENGTH_SHORT)
								.show()
						else {
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
							bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)

							timestamp = SimpleDateFormat(
								"dd/MM/yyyy hh:mm:ss a",
								Locale.getDefault()
							).format(Date())
							databaseHelper!!.editData(
								pos,
								textTitle.text.toString().trim(),
								text.text.toString().trim(),
								stream.toByteArray(),
								"$timestamp (edited)"
							)

							try {
								stream.close()
							} catch (e: Exception) {
								e.printStackTrace()
							}

							viewData()
							Snackbar.make(v!!, "Successfully edited.", Snackbar.LENGTH_SHORT).show()
						}
					}
					.setNegativeButton("Cancel", null)
					.create()
				dialog?.show()
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

	private fun deleteData(v: View?, pos: Int) {
		try {
			val cur = databaseHelper!!.query("SELECT * FROM TreeMap WHERE ID = $pos")

			if (cur.count > 0 && cur.moveToFirst()) {
				MaterialAlertDialogBuilder(requireContext()).setTitle("Delete Object")
					.setMessage("Are you sure you want to delete \"${cur.getString(3)}\"?")
					.setCancelable(false)
					.setPositiveButton("Yes") { _, _ ->
						databaseHelper!!.deleteData(pos)
						viewData()
						Snackbar.make(v!!, "Successfully deleted.", Snackbar.LENGTH_SHORT).show()
					}
					.setNegativeButton("No", null)
					.create().show()
			} else {
				Snackbar.make(
					v!!, "Error: Cannot get object at position $pos", Snackbar.LENGTH_INDEFINITE
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

	private fun createLayout(predefinedItems: LayoutItems? = null): List<View> {
		val layout = TableLayout(requireContext())
		layout.setPadding(50, 50, 50, 50)

		val textTitle = EditText(requireContext())
		textTitle.hint = HtmlCompat.fromHtml(
			"Title <strong>(Required)</strong>",
			HtmlCompat.FROM_HTML_MODE_COMPACT
		)
		textTitle.setText(predefinedItems?.title)
		layout.addView(textTitle)

		val text = EditText(requireContext())
		text.maxLines = 10
		text.hint = "Information"
		text.setText(predefinedItems?.text)
		layout.addView(text)

		imageView = ImageView(requireContext())
		if (predefinedItems?.image != null) imageView!!.setImageBitmap(predefinedItems.image)
		else imageView!!.setImageResource(R.drawable.camera)

		imageView!!.isClickable = true
		imageView!!.layoutParams = ViewGroup.LayoutParams(500, 500)
		imageView!!.tooltipText = "Select Image"
		imageView!!.setOnClickListener { selectImage() }
		layout.addView(imageView)

		return listOf(layout, textTitle, text)
	}

	private fun viewData() {
		val data: MutableList<ListData> = ArrayList()

		val cursor = databaseHelper!!.query("SELECT * FROM TreeMap")
		adapter = ListDataAdapter(requireContext(), R.layout.list, data)
		listView!!.adapter = adapter

		try {
			while (cursor.moveToNext()) {
				if (cursor.moveToFirst()) {
					data.add(
						ListData(
							cursor.getString(1),
							cursor.getString(2),
							cursor.getString(3),
							cursor.getString(4),
							cursor.getBlob(5),
							cursor.getString(6)
						)
					)
					adapter!!.notifyDataSetChanged()
				}
			}
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}

	private fun viewNearbyObjects(v: View?) {
		val nearbyData: MutableList<ListData> = ArrayList()
		val nearbyAdapter = ListDataAdapter(requireContext(), R.layout.list, nearbyData)
		nearbyListView!!.adapter = nearbyAdapter

		if (adapter!!.count > 0)
			for (i in 0..adapter!!.count)
				try {
					val currentLat = lat!!.text.toString().trim().toDouble()
					val currentLng = lng!!.text.toString().trim().toDouble()

					val listLat = adapter!!.getItem(i)!!.lat.toDouble()
					val listLng = adapter!!.getItem(i)!!.lng.toDouble()

					if (abs(currentLat - listLat) <= 0.0001 && abs(currentLng - listLng) <= 0.0001) {
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
				} catch (e: Exception) {
					e.printStackTrace()
				}
		else Snackbar.make(v!!, "No objects saved", Snackbar.LENGTH_SHORT).show()
	}

	private fun selectImage() {
		dialog = MaterialAlertDialogBuilder(requireContext()).setTitle("Select Image")
			.setItems(arrayOf("Camera", "Gallery")) { _, which ->
				when (which) {
					0 -> setImage(imageView, takeImage())
					1 -> setImage(imageView, pickImage())
				}
			}
			.create()
		dialog?.show()
	}

	private fun takeImage(): String {
		try {
			dialog?.dismiss()
			currentPhotoUri = FileProvider.getUriForFile(
				requireContext(),
				"${requireContext().packageName}.provider",
				File.createTempFile(
					"TreeMap_${System.currentTimeMillis()}",
					".jpg",
					requireContext().filesDir
				)
			)
			takeImageLauncher.launch(currentPhotoUri)
		} catch (e: Exception) {
			e.printStackTrace()
		}

		return currentPhotoUri?.path!!
	}

	private fun pickImage(): String {
		try {
			dialog?.dismiss()
			currentPhotoUri = FileProvider.getUriForFile(
				requireContext(),
				"${requireContext().packageName}.provider",
				File.createTempFile(
					"TreeMap_${System.currentTimeMillis()}",
					".jpg",
					requireContext().filesDir
				)
			)
			pickImageLauncher.launch("image/*")
		} catch (e: Exception) {
			e.printStackTrace()
		}

		return currentPhotoUri?.path!!
	}

	private fun setImage(v: ImageView?, uri: String) {
		try {
			v!!.setImageBitmap(
				BitmapFactory.decodeStream(
					requireContext().contentResolver.openInputStream(Uri.fromFile(File(uri)))
				)
			)
		} catch (e: Exception) {
			e.printStackTrace()
			Snackbar.make(v!!, "Error: ${e.message}", Snackbar.LENGTH_LONG).show()
		}
	}

	private fun setImageRotation(uri: Uri): Bitmap? {
		val bitmap =
			BitmapFactory.decodeStream(requireContext().contentResolver.openInputStream(uri))

		val matrix = Matrix()
		matrix.postRotate(90f)
		return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
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
