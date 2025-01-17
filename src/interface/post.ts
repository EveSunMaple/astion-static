export interface Post {
  id: string;
  title: string;
  blocks: Block[];
  pubDate: string;
}

export interface Block {
  id: string;
  type: string;
  has_children: boolean;

  paragraph?: Paragraph;
  heading_1?: Heading1;
  heading_2?: Heading2;
  heading_3?: Heading3;
  bulleted_list_item?: BulletedListItem;
  numbered_list_item?: NumberedListItem;
  to_do?: ToDo;
  image?: Image;
  file?: File;
  code?: Code;
  quote?: Quote;
  equation?: Equation;
  callout?: Callout;
  synced_block?: SyncedBlock;
  toggle?: Toggle;
  embed?: Embed;
  video?: Video;
  bookmark?: Bookmark;
  link_preview?: LinkPreview;
  table?: Table;
  column_list?: ColumnList;
  table_of_contents?: TableOfContents;
  link_to_page?: LinkToPage;
}

export interface Paragraph {
  rich_text: RichText[];
  color: string;
  children?: Block[];
}

export interface Heading1 {
  rich_text: RichText[];
  color: string;
  is_toggleable: boolean;
  children?: Block[];
}

export interface Heading2 {
  rich_text: RichText[];
  color: string;
  is_toggleable: boolean;
  children?: Block[];
}

export interface Heading3 {
  rich_text: RichText[];
  color: string;
  is_toggleable: boolean;
  children?: Block[];
}

export interface BulletedListItem {
  rich_text: RichText[];
  color: string;
  children?: Block[];
}

export interface NumberedListItem {
  rich_text: RichText[];
  color: string;
  children?: Block[];
}

export interface ToDo {
  rich_text: RichText[];
  checked: boolean;
  color: string;
  children?: Block[];
}

export interface Image {
  caption: RichText[];
  type: string;
  file?: FileObject;
  external?: External;
  width?: number;
  height?: number;
}

export interface Video {
  caption: RichText[];
  type: string;
  external?: External;
}

export interface File {
  caption: RichText[];
  type: string;
  file?: FileObject;
  external?: External;
}

export interface FileObject {
  type: string;
  url: string;
  expiry_time?: string;
}

export interface External {
  url: string;
}

export interface Code {
  caption: RichText[];
  rich_text: RichText[];
  language: string;
}

export interface Quote {
  rich_text: RichText[];
  color: string;
  children?: Block[];
}

export interface Equation {
  expression: string;
}

export interface Callout {
  rich_text: RichText[];
  icon: FileObject | Emoji | null;
  color: string;
  children?: Block[];
}

export interface SyncedBlock {
  synced_from: SyncedFrom | null;
  children?: Block[];
}

export interface SyncedFrom {
  block_id: string;
}

export interface Toggle {
  rich_text: RichText[];
  color: string;
  children: Block[];
}

export interface Embed {
  url: string;
}

export interface Bookmark {
  url: string;
}

export interface LinkPreview {
  url: string;
}
export interface Table {
  table_width: number;
  has_column_header: boolean;
  has_row_header: boolean;
  children: TableRow[];
}

export interface TableRow {
  id: string;
  type: string;
  has_children: boolean;
  table_row: TableCell;
}

export interface TableCell {
  cells: RichText[][];
}
export interface ColumnList {
  columns: Column[];
}

export interface Column {
  id: string;
  type: string;
  has_children: boolean;
  children: Block[];
}

export interface List {
  type: string;
  list_items: Block[];
}

export interface TableOfContents {
  color: string;
}

export interface RichText {
  text?: Text;
  annotations: Annotation;
  plain_text: string;
  href?: string;
  equation?: Equation;
  mention?: Mention;
}

export interface Text {
  content: string;
  link?: Link;
}

export interface Emoji {
  type: string;
  emoji: string;
}

export interface Annotation {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface Link {
  url: string;
}

export interface SelectProperty {
  id: string;
  name: string;
  color: string;
}

export interface LinkToPage {
  type: string;
  page_id: string;
}

export interface Mention {
  type: string;
  page?: Reference;
}

export interface Reference {
  id: string;
}
