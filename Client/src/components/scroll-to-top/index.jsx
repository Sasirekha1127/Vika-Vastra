import { Fragment } from "react";
import useScrollTop from "../../hooks/use-scroll-top";

const ScrollToTop = () => {
    const { stick, onClickHandler } = useScrollTop();
    return (
        <Fragment>
            <a
                href="https://wa.me/919482944552"
                target="_blank"
                rel="noopener noreferrer"
                className={`whatsapp-float ${stick ? "with-scroll" : ""}`}
                aria-label="Chat on WhatsApp"
            >
                <i className="fa fa-whatsapp"></i>
            </a>
            {stick && (
                <button
                    aria-label="Scroll to top"
                    type="button"
                    className="scroll-top"
                    onClick={onClickHandler}
                >
                    <i className="fa fa-angle-double-up"></i>
                </button>
            )}
        </Fragment>
    );
};

export default ScrollToTop;