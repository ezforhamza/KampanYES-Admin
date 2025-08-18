/* eslint-disable import/order */
import "@/utils/highlight";
import ReactDOM from "react-dom";

// React 19 compatibility fix for ReactQuill
// @ts-ignore
const originalFindDOMNode = ReactDOM.findDOMNode;
if (!originalFindDOMNode) {
  // @ts-ignore
  ReactDOM.findDOMNode = (node: any) => {
    if (node?.nodeType === 1) {
      return node;
    }
    if (node?.current?.nodeType === 1) {
      return node.current;
    }
    if (node?._reactInternalFiber?.stateNode) {
      return node._reactInternalFiber.stateNode;
    }
    if (node?._reactInternalInstance?.getHostNode) {
      return node._reactInternalInstance.getHostNode();
    }
    return null;
  };
}

import ReactQuill, { type ReactQuillProps } from "react-quill";
import { StyledEditor } from "./styles";
import Toolbar, { formats } from "./toolbar";

// TODO: repace react-quill with tiptap
interface Props extends ReactQuillProps {
	sample?: boolean;
}
export default function Editor({ id = "slash-quill", sample = false, ...other }: Props) {
	const modules = {
		toolbar: {
			container: `#${id}`,
		},
		history: {
			delay: 500,
			maxStack: 100,
			userOnly: true,
		},
		syntax: true,
		clipboard: {
			matchVisual: false,
		},
	};
	return (
		<StyledEditor>
			<Toolbar id={id} isSimple={sample} />
			<ReactQuill modules={modules} formats={formats} {...other} placeholder="Write something awesome..." />
		</StyledEditor>
	);
}
