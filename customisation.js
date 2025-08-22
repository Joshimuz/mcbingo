const SHOW_TAG_CUSTOMISATION_CLASS_NAME = "show-tag-customisation";
const TAG_CUSTOMISATION_SLIDERS_ID_NAME = "#tag-customisation-sliders";

function updateTags()
{
	if (VERSION.tagList !== undefined)
	{
		CURRENT_TAGS = structuredClone(VERSION.tagList);
		CURRENT_TAGS.forEach((tag) => {tag.customMax = tag.max[DIFFICULTY - 1];}); // Reset the custom max for all tags

		// Attempt to get custom tags from the URL
		var newTags = (gup('tags'));
		if (newTags !== null)
		{
			try
			{
				newTags = newTags.split("-");
				for (var i = 0; i < newTags.length; i++)
				{
					try
					{
						var tag = newTags[i].split("_");
						if (tag.length == 2)
						{
							CURRENT_TAGS.find(t => t.name === tag[0]).customMax = parseInt(tag[1]);
						}
						else
						{
							console.error("Invalid custom tag format: " + newTags[i] + ". Expected format: name-amount");
						}
					}
					catch (e)
					{
						console.error("Error parsing custom tag: " + newTags[i] + " - " + e);
						continue;
					}
				}
			}
			catch (e)
			{
				console.error("Error parsing custom tags from URL: " + e);
			}
		}
	}

    if (CURRENT_TAGS.some(tag => tag.customMax !== tag.max[DIFFICULTY - 1])) {
        $(".versionText").html("Custom " + VERSION.name);
    }
	else
	{
		$(".versionText").html(VERSION.name);
	}
}

function updateDefaultTags(value)
{
	if (VERSION.tagList !== undefined)
	{
		CURRENT_TAGS.forEach((tag) => 
		{
			if (tag.customMax !== undefined && tag.customMax == tag.max[DIFFICULTY - 1])
			{
				tag.customMax = tag.max[parseInt(value) - 1];
			}
		});
	}
}

function getTagsURL()
{
	var tags = ""; 

	if (VERSION.tagList !== undefined)
	{
		CURRENT_TAGS.forEach((tag) => 
		{
			if (tag.customMax !== undefined && tag.customMax != tag.max[DIFFICULTY - 1])
			{
				if (tags == "")
				{
					tags = "&tags=";
				}
				else
				{
					tags += "-";
				}
				tags += tag.name + "_" + tag.customMax;
			}
		});
	}

	return tags;
}

function updateTagsButton()
{
	if (VERSION.tagList !== undefined)
	{
		$("#tagcustomisation").css("display", "block");
		CURRENT_TAGS = structuredClone(VERSION.tagList);
	}
	else
	{
		$("body").removeClass(SHOW_TAG_CUSTOMISATION_CLASS_NAME);
		$("#tagcustomisation").css("display", "none");
		CURRENT_TAGS = [];
	}
}

function toggleTagCustomisationSection()
{
    $("body").toggleClass(SHOW_TAG_CUSTOMISATION_CLASS_NAME);

    if ($("body").hasClass(SHOW_TAG_CUSTOMISATION_CLASS_NAME))
    {
        const tagCustomisationsliders = $(TAG_CUSTOMISATION_SLIDERS_ID_NAME);
        tagCustomisationsliders.empty();

        let rowDiv = null;
        VERSION.tagList.forEach((tag, index) => {
            if (index % 3 === 0) {
                rowDiv = $('<div class="tag-slider-row"></div>');
                tagCustomisationsliders.append(rowDiv);
            }
            const tagName = tag.name;
            const max = CURRENT_TAGS[index].customMax !== undefined ? CURRENT_TAGS[index].customMax : tag.max;
			const currentUsage = CURRENT_TAGS[index] ? CURRENT_TAGS[index].count : 0;
			const defaultMax = CURRENT_TAGS[index].max[DIFFICULTY - 1];

            const sliderId = `tag-slider-${index}`;
            const valueId = `tag-value-${index}`;
			const usageId = `tag-usage-${index}`;
			const defaultMaxId = `tag-default-${index}`;

            const sliderHolder = $(`
                <div class="slider-holder tag-slider-holder">
                    <input type="range" class="slider tag-slider-input" id="${sliderId}" min="0" max="25" value="${max}" oninput="updateTagCustomisationSlider(${index}, this.value, true)">
                    <span class="slider-text tag-slider-text">${tagName} m<span id="${valueId}">${max}</span> c<span id="${usageId}">${currentUsage}</span> d<span id="${defaultMaxId}">${defaultMax}</span></span>
                </div>
            `);
            rowDiv.append(sliderHolder);

			if (max != defaultMax)
			{
				$("#" + valueId).parent().css("color", "red");
			}
        });
    }
}

function updateTagCustomisationSlider(index, value = CURRENT_TAGS[index].customMax !== undefined ? CURRENT_TAGS[index].customMax : tag.max, updateSheet = false)
{
	const sliderId = `#tag-slider-${index}`;
	const valueId = `#tag-value-${index}`;
	const usageId = `#tag-usage-${index}`;
	const defaultMaxId = `#tag-default-${index}`;

	$(valueId).text(value);
	$(usageId).text(CURRENT_TAGS[index] ? CURRENT_TAGS[index].count : 0);
	$(defaultMaxId).text(CURRENT_TAGS[index].max[DIFFICULTY - 1]);

	if (value != CURRENT_TAGS[index].max[DIFFICULTY - 1])
	{
		$(valueId).parent().css("color", "red");
	}
	else
	{
		$(valueId).parent().css("color", "");
	}

	CURRENT_TAGS[index].customMax = parseInt(value);

	if (updateSheet)
	{
		pushNewUrl();
		generateNewSheet();
		updateTags();
	}
}

function resetTagCustomisation()
{
	// Reset the custom max for all tags to their default values
	CURRENT_TAGS.forEach((tag, index) => {
		tag.customMax = tag.max[DIFFICULTY - 1];
		$(`#tag-slider-${index}`).val(tag.customMax);
		$(`#tag-value-${index}`).text(tag.customMax);
	});
	pushNewUrl();
	updateTags();
	generateNewSheet();

	//$("body").addClass(SHOW_TAG_CUSTOMISATION_CLASS_NAME);
}