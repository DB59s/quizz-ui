'use client'

// React Imports
import { cloneElement, useState } from 'react'
import type { ReactElement, SyntheticEvent } from 'react'

type OpenDialogOnElementClickProps = {
  element: ReactElement
  dialog: ReactElement
}

const OpenDialogOnElementClick = (props: OpenDialogOnElementClickProps) => {
  // Props
  const { element, dialog } = props

  // States
  const [open, setOpen] = useState<boolean>(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  // Clone the element and add onClick handler
  const clonedElement = cloneElement(element, {
    onClick: (e: SyntheticEvent) => {
      handleClickOpen()
      element.props.onClick && element.props.onClick(e)
    }
  })

  // Clone the dialog and add open/onClose props
  const clonedDialog = cloneElement(dialog, {
    open,
    onClose: handleClose,
    ...dialog.props
  })

  return (
    <>
      {clonedElement}
      {clonedDialog}
    </>
  )
}

export default OpenDialogOnElementClick
