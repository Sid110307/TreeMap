/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */
package com.sid.treemap

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.AdapterView.OnItemClickListener
import android.widget.EditText
import android.widget.ImageView
import android.widget.TableLayout
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
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

class HomeFragment(private val latText: String?, private val lngText: String?) : Fragment() {
	private lateinit var binding: HomeBinding

	private var adapter: ListDataAdapter? = null
	private var databaseHelper: DatabaseHelper? = null

	private var timestamp: String? = null
	private var imageView: ImageView? = null
	private var currentPhotoUri: Uri? = null
	private var dialog: AlertDialog? = null

	private val takeImageLauncher =
		registerForActivityResult(ActivityResultContracts.TakePicture()) { success ->
			if (success) imageView?.setImageBitmap(
				BitmapFactory.decodeStream(
					requireContext().contentResolver.openInputStream(currentPhotoUri!!)
				)
			)
			dialog?.dismiss()
		}

	private val pickImageLauncher =
		registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
			if (uri != null) imageView?.setImageBitmap(
				BitmapFactory.decodeStream(requireContext().contentResolver.openInputStream(uri))
			)
			dialog?.dismiss()
		}

	override fun onCreateView(
		inflater: LayoutInflater,
		container: ViewGroup?,
		savedInstanceState: Bundle?,
	): View {
		super.onCreateView(inflater, container, savedInstanceState)
		binding = HomeBinding.inflate(layoutInflater)

		binding.latDisplay.text = latText
		binding.lngDisplay.text = lngText
		databaseHelper = DatabaseHelper(requireContext(), "TreeMap.sqlite", null, 1)

		binding.list.emptyView = binding.empty
		binding.list.invalidateViews()
		binding.list.refreshDrawableState()

		binding.listNearby.invalidateViews()
		binding.listNearby.refreshDrawableState()

		timestamp = SimpleDateFormat("dd/MM/yyyy hh:mm:ss a", Locale.getDefault()).format(Date())
		viewData()
		binding.listNear.setOnClickListener(::viewNearbyObjects)
		binding.save.setOnClickListener(::addData)

		binding.list.onItemClickListener =
			OnItemClickListener { v, _, position, _ ->
				editData(v, position + 1)
			}

		binding.list.onItemLongClickListener =
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
						binding.latDisplay.text.toString().trim(),
						binding.lngDisplay.text.toString().trim(),
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

	private fun createLayout(default: LayoutItems? = null): List<View> {
		val layout = TableLayout(requireContext())
		layout.setPadding(50, 50, 50, 50)

		val textTitle = EditText(requireContext())
		textTitle.hint = HtmlCompat.fromHtml(
			"Title <strong>(Required)</strong>",
			HtmlCompat.FROM_HTML_MODE_COMPACT
		)
		textTitle.setText(default?.title)
		layout.addView(textTitle)

		val text = EditText(requireContext())
		text.maxLines = 10
		text.hint = "Information"
		text.setText(default?.text)
		layout.addView(text)

		imageView = ImageView(requireContext())
		if (default?.image != null) imageView!!.setImageBitmap(default.image)
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
		binding.list.adapter = adapter

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
		binding.listNearby.adapter = nearbyAdapter

		if (adapter!!.count > 0)
			for (i in 0..adapter!!.count)
				try {
					val currentLat = binding.latDisplay.text.toString().trim().toDouble()
					val currentLng = binding.lngDisplay.text.toString().trim().toDouble()

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

	override fun onPause() {
		super.onPause()
		dialog?.dismiss()
	}

	override fun onResume() {
		super.onResume()
		dialog?.show()
	}
}
