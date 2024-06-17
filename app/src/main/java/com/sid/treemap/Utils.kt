/*
 * Copyright (c) 2020 - Present Siddharth Praveen Bharadwaj.
 * All rights reserved.
 */

package com.sid.treemap

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.net.Uri
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.TableLayout
import androidx.activity.result.ActivityResultLauncher
import androidx.core.content.FileProvider
import androidx.core.text.HtmlCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.MutableLiveData
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import java.io.ByteArrayOutputStream
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class Utils(
	private val context: Context,
	private val fragment: Fragment,
	private val lat: String,
	private val lng: String,
	private val takeImageLauncher: ActivityResultLauncher<Uri>,
	private val pickImageLauncher: ActivityResultLauncher<String>,
) {
	private lateinit var imageView: ImageView
	private var currentPhotoUri: Uri? = null

	private fun takeImage(): Uri {
		try {
			currentPhotoUri = FileProvider.getUriForFile(
				context,
				"${context.packageName}.provider",
				File.createTempFile(
					"TreeMap_${System.currentTimeMillis()}",
					".jpg",
					context.filesDir
				).apply { deleteOnExit() }
			)
			takeImageLauncher.launch(currentPhotoUri)
		} catch (e: Exception) {
			e.printStackTrace()
		}

		return currentPhotoUri!!
	}

	private fun pickImage(): Uri {
		try {
			currentPhotoUri = FileProvider.getUriForFile(
				context,
				"${context.packageName}.provider",
				File.createTempFile(
					"TreeMap_${System.currentTimeMillis()}",
					".jpg",
					context.filesDir
				).apply { deleteOnExit() }
			)
			pickImageLauncher.launch("image/*")
		} catch (e: Exception) {
			e.printStackTrace()
		}

		return currentPhotoUri!!
	}

	private fun setImage(uri: Uri) {
		try {
			imageView.setImageURI(uri)
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}

	private fun selectImage() {
		MaterialAlertDialogBuilder(context).setTitle("Select Image")
			.setItems(arrayOf("Camera", "Gallery")) { _, which ->
				when (which) {
					0 -> setImage(takeImage())
					1 -> setImage(pickImage())
				}
			}
			.create().show()
	}

	private fun createLayout(default: LayoutItems? = null): List<View> {
		takingImage.observe(fragment.viewLifecycleOwner) { if (it) setImage(currentPhotoUri!!) }
		pickingImage.observe(fragment.viewLifecycleOwner) { if (it != null) setImage(it) }

		val layout = TableLayout(context)
		layout.setPadding(50, 50, 50, 50)

		val textTitle = EditText(context)
		textTitle.hint = HtmlCompat.fromHtml(
			"Title <strong>(Required)</strong>",
			HtmlCompat.FROM_HTML_MODE_COMPACT
		)
		textTitle.setText(default?.title)
		layout.addView(textTitle)

		val text = EditText(context)
		text.maxLines = 10
		text.hint = "Information"
		text.setText(default?.text)
		layout.addView(text)

		imageView = ImageView(context)
		if (default?.image != null) imageView.setImageBitmap(BitmapFactory.decodeFile(default.image))
		else imageView.setImageResource(R.drawable.camera)

		imageView.isClickable = true
		imageView.layoutParams = ViewGroup.LayoutParams(500, 500)
		imageView.tooltipText = "Select Image"
		imageView.setOnClickListener { selectImage() }
		layout.addView(imageView)

		return listOf(layout, textTitle, text)
	}

	fun showDialog(v: View, databaseHelper: DatabaseHelper, mode: Mode, pos: Int? = null) {
		try {
			val cur = databaseHelper.query("SELECT * FROM TreeMap WHERE ID = $pos")

			if ((cur.count > 0 && cur.moveToFirst()) || mode == Mode.Add) {
				if (mode == Mode.Delete) {
					MaterialAlertDialogBuilder(context).setTitle("Delete Object")
						.setMessage("Are you sure you want to delete \"${cur.getString(3)}\"?")
						.setCancelable(false)
						.setPositiveButton("Yes") { _, _ ->
							databaseHelper.deleteData(pos!!)
							Snackbar.make(v, "Successfully deleted.", Snackbar.LENGTH_SHORT).show()
						}
						.setNegativeButton("No", null)
						.create().show()
					return
				}

				var (layout, textTitle, text) = if (mode == Mode.Edit) createLayout(
					LayoutItems(
						cur.getString(3),
						cur.getString(4),
						cur.getString(5),
					)
				) else createLayout()

				layout = layout as TableLayout
				textTitle = textTitle as EditText
				text = text as EditText

				MaterialAlertDialogBuilder(v.context).setTitle("${mode.name} Object Info")
					.setView(layout)
					.setCancelable(false)
					.setPositiveButton("Save") { _, _ ->
						if (textTitle.text.toString().trim().isEmpty())
							Snackbar.make(v, "Please enter a title.", Snackbar.LENGTH_SHORT).show()
						else {
							val drawable = imageView.drawable
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
							val imagePath = File.createTempFile(
								"TreeMap_${System.currentTimeMillis()}",
								".jpg",
								context.filesDir
							).also { it.writeBytes(stream.toByteArray()) }.absolutePath

							val timestamp = SimpleDateFormat(
								"dd/MM/yyyy hh:mm:ss a", Locale.getDefault()
							).format(Date())

							if (mode == Mode.Add) databaseHelper.insertData(
								textTitle.text.toString().trim(),
								text.text.toString().trim(),
								imagePath,
								lat.trim(),
								lng.trim(),
								timestamp
							) else databaseHelper.editData(
								pos!!,
								textTitle.text.toString().trim(),
								text.text.toString().trim(),
								imagePath,
								"$timestamp (edited)"
							)

							try {
								stream.close()
							} catch (e: Exception) {
								e.printStackTrace()
							}

							Snackbar.make(v, "Successfully saved.", Snackbar.LENGTH_SHORT).show()
						}
					}
					.setNegativeButton("Cancel", null)
					.create().show()
			} else Snackbar.make(
				v, "Error: Cannot get object at position $pos", Snackbar.LENGTH_INDEFINITE
			).also { snackbar -> snackbar.setAction("Dismiss") { snackbar.dismiss() }.show() }

			cur.close()
		} catch (e: Exception) {
			e.printStackTrace()
			Snackbar.make(v, "Error: ${e.message}", Snackbar.LENGTH_INDEFINITE)
				.also { snackbar -> snackbar.setAction("Dismiss") { snackbar.dismiss() }.show() }
		}
	}

	companion object {
		var takingImage: MutableLiveData<Boolean> = MutableLiveData(false)
		var pickingImage: MutableLiveData<Uri> = MutableLiveData()
	}

	data class LayoutItems(var title: String, var text: String, var image: String)
	enum class Mode { Add, Edit, Delete }
}
