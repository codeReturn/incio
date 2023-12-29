import React from 'react';

import docZoomIcon1 from '../images/doc_zoom1.png'
import docZoomIcon2 from '../images/doc_zoom2.gif'
import docZoomIcon3 from '../images/doc_zoom3.png'

const Documentation = () => {
    return (
        <>
        <div className="page">
            <h1>Zoom Integration</h1>
            <h3>Step 1: How to Connect your Zoom with Incio</h3>

            <h5>Visit your <a href="/account" target="_blank"> Integrations page </a> and select Zoom. </h5>
            <ul>
                <li>1. Select Connect Zoom.</li>

                <img src={docZoomIcon1} className="img-fluid" style={{ maxHeight: "400px" }} />

                <li>Sign in to your Zoom account.</li>
                <li>Select Authorize to let Incio access your Zoom account.</li>
            </ul>

            <p>If you are having Problems, Please go on the FAQ page or alternatively you can contact our support team for more help.</p>

            <h3>Step 2: Select Zoom as your location </h3>
            <p>Once you've connected, you'll be redirected to Incio Meetings. There you can now create and Event and Set Zoom as your location.</p>
            <img src={docZoomIcon2} className="img-fluid" style={{ maxHeight: "400px" }} />
            <p>2. Select Save & Close.</p>
            <p>3. Repeat these steps for each event type you'd like to use Zoom with.</p>

            <h3>Step 3: Meet over Zoom</h3>
            <p>After your invitee books with the selected event, you and your invitee will receive Zoom details via confirmation email and calendar event. The meeting will also show in your Zoom account under Upcoming Meetings.</p>
            <img src={docZoomIcon3} className="img-fluid" style={{ maxHeight: "400px" }} />

            <h3>How to Remove your Zoom App.</h3>
            <ul>
                <li>Visit your <a href="/account" target="_blank"> Integrations page </a> and select Zoom.</li>
                <li>Click on Disconnect Zoom</li>
                <li>Your Zoom App will be removed</li>
            </ul>

            <p>Note: By Disconnecting your Zoom from Incio means you will no longer be able to create Events with Zoom as the primary option which means you won’t be able to create any automatic meetings/invites for your self/invitees.</p>
        </div>            
        </>
    )
}

export default Documentation;