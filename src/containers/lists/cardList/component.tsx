//我的书摘，笔记的卡片
import React from "react";
import "./cardList.css";
import NoteModel from "../../../model/Note";
import { Trans } from "react-i18next";
import { CardListProps, CardListStates } from "./interface";
import DeleteIcon from "../../../components/deleteIcon";
import RecordLocation from "../../../utils/readUtils/recordLocation";
import { withRouter } from "react-router-dom";
import SortUtil from "../../../utils/readUtils/sortUtil";
import { Redirect } from "react-router-dom";
import NoteTag from "../../../components/noteTag";
import BookUtil from "../../../utils/bookUtil";

class CardList extends React.Component<CardListProps, CardListStates> {
  constructor(props: CardListProps) {
    super(props);
    this.state = { deleteKey: "" };
  }
  //根据bookkey获取
  handleBookName = (bookKey: string) => {
    let { books } = this.props;
    let bookName = "";
    for (let i = 0; i < this.props.books.length; i++) {
      if (books[i].key === bookKey) {
        bookName = books[i].name;
        break;
      }
    }
    return bookName;
  };
  handleShowDelete = (deleteKey: string) => {
    this.setState({ deleteKey });
  };
  handleJump = (cfi: string, bookKey: string, percentage: number) => {
    let { books } = this.props;
    let book: any;
    //根据bookKey获取指定的book和epub
    for (let i = 0; i < books.length; i++) {
      if (books[i].key === bookKey) {
        book = books[i];
        break;
      }
    }
    if (!book) {
      this.props.handleMessage("Book not exist");
      this.props.handleMessageBox(true);
      return;
    }
    RecordLocation.recordCfi(bookKey, cfi, percentage);
    BookUtil.RedirectBook(book);
  };
  render() {
    let { cards } = this.props;
    if (cards.length === 0) {
      return <Redirect to="/manager/empty" />;
    }

    let noteObj = SortUtil.sortNotes(
      cards,
      this.props.noteSortCode,
      this.props.books
    );
    const renderCardListItem = (title: string) => {
      return noteObj![title].map((item: NoteModel, index: number) => {
        const cardProps = {
          itemKey: item.key,
          mode: "notes",
        };
        return (
          <li
            className="card-list-item"
            key={index}
            onMouseOver={() => {
              this.handleShowDelete(item.key);
            }}
            onMouseLeave={() => {
              this.handleShowDelete("");
            }}
            style={
              this.props.mode === "note" && !this.props.isCollapsed
                ? { height: "250px" }
                : this.props.mode === "note" && this.props.isCollapsed
                ? { height: "250px", width: "calc(50vw - 70px)" }
                : this.props.isCollapsed
                ? { width: "calc(50vw - 70px)" }
                : {}
            }
          >
            <div className="card-list-item-card">
              <div style={{ position: "relative", bottom: "25px" }}>
                {this.state.deleteKey === item.key ? (
                  <DeleteIcon {...cardProps} />
                ) : null}
              </div>
              <div className="card-list-item-text-parent">
                <div className="card-list-item-note">
                  {this.props.mode === "note" ? item.notes : item.text}
                </div>
              </div>
              {this.props.mode === "note" ? (
                <div className="card-list-item-text-note">
                  <div className="card-list-item-text">{item.text}</div>
                </div>
              ) : null}

              <div className="card-list-item-citation">
                <div className="card-list-item-title">
                  <Trans>From</Trans>《
                </div>
                <div className="card-list-item-chapter card-list-item-title">
                  {this.handleBookName(item.bookKey)}
                </div>
                <div className="card-list-item-chapter card-list-item-title">
                  》<Trans>{item.chapter}</Trans>
                </div>
              </div>
              <div
                className="note-tags"
                style={{
                  position: "absolute",
                  bottom: "20px",
                  height: "70px",
                }}
              >
                <NoteTag
                  {...{
                    handleTag: () => {},
                    tag: item.tag || [],
                    isCard: true,
                  }}
                />
              </div>
              <div
                onClick={() => {
                  this.handleJump(item.cfi, item.bookKey, item.percentage);
                }}
              >
                <div
                  className="card-list-item-show-more"
                  style={{ bottom: "10px" }}
                >
                  {this.props.mode === "note" ? (
                    <Trans>{"More Notes"}</Trans>
                  ) : (
                    <Trans>{"More Digests"}</Trans>
                  )}

                  <span className="icon-dropdown icon-card-right"></span>
                </div>
              </div>
            </div>
          </li>
        );
      });
    };
    const renderCardList = () => {
      return Object.keys(noteObj!).map((item, index) => {
        return (
          <li className="card-page-item" key={index}>
            <div className="card-page-item-date">{item}</div>
            <ul className="card-list-container-box">
              {renderCardListItem(item)}
            </ul>
          </li>
        );
      });
    };
    return <div className="card-list-container">{renderCardList()}</div>;
  }
}

export default withRouter(CardList);
