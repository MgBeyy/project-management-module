import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

type ResizableTitleProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  onResize?: (e: unknown, data: { size: { width: number; height: number } }) => void;
};

export const ResizableTitle: React.FC<ResizableTitleProps> = (props) => {
  const { onResize, width, minWidth = 80, maxWidth = 600, style, children, ...rest } = props;
  if (!width) return <th {...rest}>{children}</th>;

  return (
    <Resizable
      width={width}
      height={40} // 0 olmasın (bazı ortamlarda event kaçabiliyor)
      onResize={onResize as any}
      minConstraints={[minWidth, 0]}
      maxConstraints={[maxWidth, 0]}
      draggableOpts={{ enableUserSelectHack: false }}
      handle={
        <div
          onClick={(e) => e.stopPropagation()}
          className="th-resize-handle"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 12,          // geniş hit-area
            cursor: "col-resize",
            zIndex: 2,
          }}
        />
      }

    >
      <th
        {...rest}
        style={{
          ...style,
          position: "relative",
          paddingRight: 12, // tutacakla çakışmasın
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </th>
    </Resizable>
  );
};